/**
 * VERCEL SERVERLESS FUNCTION: /api/chat
 * Secure server-side proxy for Groq Cloud API.
 * Keeps GROQ_API_KEY safe in environment variables away from the browser.
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { messages } = req.body || {};

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Missing or invalid messages payload' });
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
                messages: messages,
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
