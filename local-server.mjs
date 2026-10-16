import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

// Load .env if present
try {
    if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile();
    } else {
        // Fallback simple parser for older Node versions
        if (fs.existsSync('.env')) {
            const envContent = fs.readFileSync('.env', 'utf-8');
            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [k, ...v] = trimmed.split('=');
                    if (k && !process.env[k.trim()]) {
                        process.env[k.trim()] = v.join('=').trim();
                    }
                }
            });
        }
    }
} catch (e) {
    // Ignore .env read errors if already defined or missing
}

// Import serverless chat and contact handlers
let chatHandler = null;
try {
    const chatModule = await import('./api/chat.js');
    chatHandler = chatModule.default || chatModule;
} catch (err) {
    console.warn('Notice: Could not load ./api/chat.js directly:', err.message);
}

let contactHandler = null;
try {
    const contactModule = await import('./api/contact.js');
    contactHandler = contactModule.default || contactModule;
} catch (err) {
    console.warn('Notice: Could not load ./api/contact.js directly:', err.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp4': 'video/mp4'
};

const server = http.createServer(async (req, res) => {
    // Set basic security & CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // API Route: /api/chat
    if (pathname === '/api/chat' || pathname === '/api/chat.js') {
        // Enhance response object to mimic Vercel/Express response helpers
        res.status = function (statusCode) {
            res.statusCode = statusCode;
            return res;
        };
        res.json = function (data) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
            return res;
        };
        res.send = function (data) {
            if (typeof data === 'object') {
                return res.json(data);
            }
            res.end(data);
            return res;
        };

        if (chatHandler) {
            let bodyData = '';
            req.on('data', chunk => { bodyData += chunk; });
            req.on('end', async () => {
                try {
                    req.body = bodyData ? JSON.parse(bodyData) : {};
                } catch {
                    req.body = {};
                }
                try {
                    await chatHandler(req, res);
                } catch (handlerErr) {
                    console.error('API Error:', handlerErr);
                    if (!res.writableEnded) {
                        res.status(500).json({ error: handlerErr.message || 'Server error' });
                    }
                }
            });
            return;
        } else {
            res.status(500).json({ error: 'Chat API handler not available.' });
            return;
        }
    }

    // API Route: /api/contact
    if (pathname === '/api/contact' || pathname === '/api/contact.js') {
        res.status = function (statusCode) {
            res.statusCode = statusCode;
            return res;
        };
        res.json = function (data) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
            return res;
        };

        if (contactHandler) {
            let bodyData = '';
            req.on('data', chunk => { bodyData += chunk; });
            req.on('end', async () => {
                try {
                    req.body = bodyData ? JSON.parse(bodyData) : {};
                } catch {
                    req.body = {};
                }
                try {
                    await contactHandler(req, res);
                } catch (handlerErr) {
                    console.error('Contact API Error:', handlerErr);
                    if (!res.writableEnded) {
                        res.status(500).json({ error: handlerErr.message || 'Server error' });
                    }
                }
            });
            return;
        } else {
            res.status(500).json({ error: 'Contact API handler not available.' });
            return;
        }
    }

    // Static File Serving with filesystem-aware containment check
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const resolvedBase = path.resolve(__dirname);
    const safePath = path.resolve(resolvedBase, '.' + path.normalize(pathname));
    const relativePath = path.relative(resolvedBase, safePath);
    const isContained = !relativePath.startsWith('..') && !path.isAbsolute(relativePath);

    if (!isContained) {
        res.statusCode = 403;
        return res.end('Access Denied');
    }

    fs.stat(safePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.end(`
                <!DOCTYPE html>
                <html>
                <head><title>404 Not Found</title></head>
                <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0b0f17; color: #fff;">
                    <h2>404 - Page or Resource Not Found</h2>
                    <p><a href="/" style="color: #6366f1;">Back to Portfolio Home</a></p>
                </body>
                </html>
            `);
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;

        // 304 Cache Validation
        if (req.headers['if-none-match'] === etag) {
            res.statusCode = 304;
            return res.end();
        }

        res.setHeader('ETag', etag);
        res.setHeader('Vary', 'Accept-Encoding');
        if (pathname.startsWith('/assets/images/')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);

        const isCompressible = /^(text\/|application\/javascript|application\/json|image\/svg\+xml)/.test(contentType);
        const acceptEncoding = req.headers['accept-encoding'] || '';

        if (isCompressible && acceptEncoding.includes('gzip')) {
            res.setHeader('Content-Encoding', 'gzip');
            const stream = fs.createReadStream(safePath);
            const gzip = zlib.createGzip({ level: 6 });
            stream.pipe(gzip).pipe(res);
        } else {
            const stream = fs.createReadStream(safePath);
            stream.pipe(res);
        }
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n⚠️ Port ${PORT} is currently in use. Please stop the existing process or run with: PORT=3001 npm run dev\n`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` 🚀 PORTFOLIO WEBSITE READY!`);
    console.log(` 🌐 OPEN IN BROWSER: http://localhost:${PORT}`);
    console.log(` ------------------------------------------------------`);
    console.log(` 🤖 AI Chatbot Engine: /api/chat (Internal API)`);
    console.log(` 🔑 GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'Loaded from .env ✅' : 'Missing ⚠️'}`);
    console.log(`======================================================\n`);
});
