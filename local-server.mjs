import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
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

    // Static File Serving
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const safePath = path.normalize(path.join(__dirname, pathname));
    if (!safePath.toLowerCase().startsWith(__dirname.toLowerCase())) {
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
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);

        const stream = fs.createReadStream(safePath);
        stream.pipe(res);
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n⚠️ Port ${PORT} is currently in use. Please stop the existing process or run with: PORT=3001 npm run dev\n`);
    } else {
        console.error('Server error:', err);
    }
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` 🚀 Indrajit's Portfolio is running locally!`);
    console.log(` 🌐 URL: http://localhost:${PORT}`);
    console.log(` 🤖 AI Chatbot Proxy: http://localhost:${PORT}/api/chat`);
    console.log(` 🔑 GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'Loaded from .env ✅' : 'Missing ⚠️'}`);
    console.log(`======================================================\n`);
});
