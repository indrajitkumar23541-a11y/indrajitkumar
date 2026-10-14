/**
 * VERCEL SERVERLESS FUNCTION: /api/contact
 * Handles contact form messages from the portfolio.
 * Forwards inquiries directly to indrajitkumar23541@gmail.com via FormSubmit gateway.
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body || {};

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        // Pass through proper browser origin & referer headers
        const origin = req.headers.origin || req.headers.referer || 'http://localhost:3000';
        const referer = req.headers.referer || req.headers.origin || 'http://localhost:3000/';

        // Forward to FormSubmit gateway
        const response = await fetch('https://formsubmit.co/ajax/indrajitkumar23541@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': origin,
                'Referer': referer
            },
            body: JSON.stringify({
                name,
                email,
                _subject: `Portfolio Inquiry from ${name}: ${subject || 'New Contact'}`,
                subject: subject || 'Portfolio Contact',
                message,
                _template: 'table',
                _captcha: 'false'
            })
        });

        const data = await response.json().catch(() => ({}));

        // Verify that FormSubmit actually accepted the message
        const isSuccess = response.ok && (data.success === 'true' || data.success === true || (data.message && data.message.includes('successfully')));

        if (!isSuccess) {
            console.error('FormSubmit gateway rejected:', data);
            return res.status(400).json({
                success: false,
                message: data.message || 'FormSubmit gateway rejected the message.',
                details: data
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Message processed and dispatched successfully.',
            details: data
        });

    } catch (error) {
        console.error('Contact handler error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
