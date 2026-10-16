/**
 * VERCEL SERVERLESS FUNCTION: /api/chat
 * Secure server-side proxy for Groq Cloud API.
 * Keeps GROQ_API_KEY safe in environment variables away from the browser.
 */

export default async function handler(req, res) {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Health-check / ping endpoint
    if (req.method === 'GET') {
        const accept = req.headers['accept'] || '';
        // If accessed directly from browser URL bar (HTML navigation), redirect to portfolio homepage
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
            model: 'indraintel-v2.0'
        });
    }

    // Only allow POST requests for chat completions
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

        // Bounded context window: separate system prompt from conversation turns safely
        const systemMessage = validMessages.find(m => m.role === 'system');
        const conversationTurns = validMessages.filter(m => m.role !== 'system');

        // Construct bounded message list: system prompt first (if present), followed by latest 12 conversation turns
        const boundedMessages = systemMessage 
            ? [systemMessage, ...conversationTurns.slice(-12)]
            : conversationTurns.slice(-12);

        if (boundedMessages.length === 0) {
            return res.status(400).json({ error: 'Conversation messages payload is empty.' });
        }

        // Get key securely from Vercel Environment Variables
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'GROQ_API_KEY is not configured in Vercel project environment variables.'
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
                model: 'qwen/qwen3.8-27b',
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
        return res.status(200).json(data);

    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
