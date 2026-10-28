/**
 * VERCEL SERVERLESS FUNCTION: /api/chat
 * Secure server-side proxy for Groq Cloud API.
 * Keeps GROQ_API_KEY safe in environment variables away from the browser.
 * Hardened against Prompt Injection, System Hijacking, and Unrestricted CORS.
 */

const ALLOWED_ORIGINS = [
    'https://indrajitkumar.me',
    'https://www.indrajitkumar.me',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

function isOriginAllowed(origin) {
    if (!origin) return true; // Direct same-origin requests
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    if (/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(origin)) return true;
    return false;
}

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://indrajitkumar.me');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const MODEL = 'qwen/qwen3.8-27b';

    // Health-check / ping endpoint
    if (req.method === 'GET') {
        const accept = req.headers['accept'] || '';
        if (accept.includes('text/html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="refresh" content="0;url=/">
                    <title>Opening Indrajit's Portfolio...</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF8F5; color: #1E1410; }
                        .card { background: #FFFFFF; padding: 2.5rem; border-radius: 16px; box-shadow: 0 20px 40px rgba(40,26,20,0.08); text-align: center; max-width: 460px; border: 1px solid rgba(122,75,53,0.12); }
                        h2 { margin-top: 0; color: #7A4B35; font-size: 1.35rem; }
                        p { color: #6E5346; line-height: 1.5; font-size: 0.95rem; }
                        a { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.6rem; background: #7A4B35; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>Opening Indrajit's Portfolio...</h2>
                        <p>Redirecting you to the portfolio homepage...</p>
                        <a href="/">Click here if not redirected automatically</a>
                    </div>
                </body>
                </html>
            `);
        }

        return res.status(200).json({
            status: 'ok',
            service: 'IndraIntel AI Engine',
            model: MODEL
        });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch { body = {}; }
        }

        const { messages } = body || {};

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Missing or invalid messages payload' });
        }

        // Validate and sanitize messages: ensure each item is a valid object with role and content
        const validMessages = messages.filter(m => 
            m && 
            typeof m === 'object' && 
            typeof m.role === 'string' && 
            typeof m.content === 'string' &&
            m.content.trim().length > 0
        );

        if (validMessages.length === 0) {
            return res.status(400).json({ error: 'No valid messages with string role and content provided.' });
        }

        // AUTHORITATIVE IMMUTABLE SYSTEM PROMPT (Defends against prompt injection & hijacking)
        const AUTHORITATIVE_SYSTEM_PROMPT = `You are the personal AI Assistant for Indrajit Kumar, integrated into his developer portfolio.
Your role is to answer questions from recruiters, hiring managers, and engineers about Indrajit's technical skills, projects, background, and hiring availability.

VERIFIED DOSSIER ON INDRAJIT KUMAR:
- Full Name: Indrajit Kumar
- Professional Identity: Software Engineer | Full-Stack Development & AI Integration | Product Builder
- Education: B.Tech in Computer Science (2023 – Expected 2027) at Jagannath University, Jaipur, Rajasthan, India.
- Flagship Projects:
  1. PraGo (Healthcare AI Super App, microservices, Gemini Vision, Razorpay, Docker)
  2. Indra-MarketMind (Quantitative Financial AI Terminal, NLP sentiment, PyTorch Bi-LSTM, pgvector, Redis)
  3. VELOCITY X (Console-grade 3D WebGL highway pursuit racing engine, locked 60-120 FPS)
  4. Yaadon Ki Duniya (Interactive Audio-Visual Indian Nostalgia Platform, 700+ songs, Web Audio synthesis)
- Contact: indrajitkumar23541@gmail.com | +91-7061661897 | Jaipur, Rajasthan, India.
- Availability: Actively seeking Software Engineering Internships and Entry-Level Software Engineer roles (Remote / On-site).
Be concise, professional, warm, and recruiter-focused.`;

        // 1. Enforce server-side system prompt strictly. NEVER accept client system override.
        const guardedSystemMessage = {
            role: 'system',
            content: AUTHORITATIVE_SYSTEM_PROMPT
        };

        // 2. Guard conversation turns: strictly allow only 'user' or 'assistant' roles with bounded content
        const conversationTurns = validMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({
                role: m.role,
                content: m.content.slice(0, 2000)
            }));

        if (conversationTurns.length === 0) {
            return res.status(400).json({ error: 'At least one user message is required in the conversation turns.' });
        }

        // 3. Construct bounded message list: system prompt first, followed by at most 10 recent conversation turns
        const boundedMessages = [
            guardedSystemMessage,
            ...conversationTurns.slice(-10)
        ];

        // Get key securely from Vercel Environment Variables
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'GROQ_API_KEY is not configured in environment variables.'
            });
        }

        // Call Groq Cloud completions API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: boundedMessages,
                temperature: 0.6,
                max_tokens: 450
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                error: errData.error?.message || `Groq API responded with status ${response.status}`
            });
        }

        const data = await response.json();
        data.model = data.model || MODEL;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Serverless chat error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
