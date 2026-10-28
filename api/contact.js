/**
 * VERCEL SERVERLESS FUNCTION: /api/contact
 * Handles contact form messages from the portfolio.
 * Forwards inquiries directly to indrajitkumar23541@gmail.com via FormSubmit gateway.
 * Hardened with Input Capping, Honeypot Bot Detection, and Strict CORS.
 */

const ALLOWED_ORIGINS = [
    'https://indrajitkumar.me',
    'https://www.indrajitkumar.me',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

function isOriginAllowed(origin) {
    if (!origin) return true;
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

    // Health-check / ping endpoint
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'ok',
            service: 'Indrajit Portfolio Contact Gateway'
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

        const { name, email, subject, message, website, _gotcha } = body || {};

        // Bot Honeypot: Automated spam bots often fill hidden fields like 'website' or '_gotcha'
        if (website || _gotcha) {
            // Silently pretend success without dispatching email
            return res.status(200).json({
                success: true,
                message: 'Inquiry received.'
            });
        }

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        // Input length bounds
        const cleanName = String(name).trim().slice(0, 100);
        const cleanEmail = String(email).trim().slice(0, 120);
        const cleanSubject = String(subject || 'Portfolio Contact').trim().slice(0, 150);
        const cleanMessage = String(message).trim().slice(0, 3000);

        if (cleanName.length < 2 || cleanMessage.length < 5) {
            return res.status(400).json({ error: 'Please provide valid text for name and message.' });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        const browserOrigin = req.headers.origin || req.headers.referer || 'https://indrajitkumar.me';
        const browserReferer = req.headers.referer || req.headers.origin || 'https://indrajitkumar.me/';

        // Forward to FormSubmit gateway
        const response = await fetch('https://formsubmit.co/ajax/indrajitkumar23541@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': browserOrigin,
                'Referer': browserReferer
            },
            body: JSON.stringify({
                name: cleanName,
                email: cleanEmail,
                _subject: `Portfolio Inquiry from ${cleanName}: ${cleanSubject}`,
                subject: cleanSubject,
                message: cleanMessage,
                _template: 'table',
                _captcha: 'false'
            })
        });

        const data = await response.json().catch(() => ({}));

        // Strict verification
        const msgStr = typeof data.message === 'string' ? data.message.toLowerCase() : '';
        const hasNegativeSignal = !response.ok ||
            data.success === 'false' ||
            data.success === false ||
            Boolean(data.error) ||
            /fail|error|unable|reject|invalid|blocked|spam/i.test(msgStr);

        const hasPositiveSignal = (
            data.success === 'true' ||
            data.success === true ||
            (msgStr.includes('successfully') && !hasNegativeSignal) ||
            (msgStr.includes('check your email') && !hasNegativeSignal)
        );

        const isSuccess = response.ok && !hasNegativeSignal && hasPositiveSignal;

        if (!isSuccess) {
            console.error('FormSubmit gateway rejected submission:', { status: response.status });
            return res.status(400).json({
                success: false,
                message: (typeof data.message === 'string' && data.message) ? data.message : 'Message transmission failed at email gateway. Please try again or email directly.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Message processed and dispatched successfully.'
        });

    } catch (error) {
        console.error('Contact handler error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
