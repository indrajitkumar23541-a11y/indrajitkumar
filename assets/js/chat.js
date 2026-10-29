/**
 * INDRAJIT KUMAR — INDRAINTEL STANDALONE CHAT ENGINE
 * Dedicated full-page interactive copilot powered by Groq Cloud (Qwen / Llama 3.3)
 */

document.addEventListener('DOMContentLoaded', () => {
    const aiMessages = document.getElementById('ai-messages');
    const aiForm = document.getElementById('ai-form');
    const aiInput = document.getElementById('ai-user-input');
    const promptChips = document.querySelectorAll('.prompt-chip');
    const btnClearChat = document.getElementById('btn-clear-chat');
    const aiStatusText = document.getElementById('ai-status-text');

    const GROQ_CONFIG = {
        apiKey: '',
        model: 'qwen/qwen3.8-27b',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions'
    };

    const INDRAJIT_SYSTEM_PROMPT = `You are the personal AI Assistant for Indrajit Kumar, integrated into his official developer portfolio.
Your role is to answer questions from recruiters, hiring managers, and engineers about Indrajit's technical skills, projects, background, and hiring availability.

VERIFIED DOSSIER ON INDRAJIT KUMAR:
- Full Name: Indrajit Kumar
- Professional Identity: Software Engineer | Full-Stack Development & AI Integration | Product Builder
- Education: B.Tech in Computer Science (Jul 2023 – Expected Jul 2027) at Jagannath University, Jaipur, Rajasthan, India. First Class Division Track. Coursework: Data Structures & Algorithms, Operating Systems, DBMS, Computer Networks, OOP, AI, ML.
- Technical Specialization: Full-Stack Web Development, Backend Architecture, Database Systems & AI/LLM Integration.
- Technical Stack:
  • Languages: C, C++ (DSA), JavaScript (ES6+), Python, Java, SQL
  • Frontend: HTML5, CSS3, React.js, Next.js, Vite, Tailwind CSS
  • Backend: Node.js, Express.js, Django, Flask, FastAPI, GraphQL, Socket.io, WebSocket, REST API, JWT Authentication, Firebase, Supabase
  • Databases: MySQL, PostgreSQL, SQLite, MongoDB
  • AI/ML: AI Integration, Generative AI, Prompt Engineering, LLM Integration, OpenAI API, Google Gemini API, Grok API, Ollama, Llama 3, RAG, Qwen, PyTorch
  • DevOps & Tools: Git, GitHub, VS Code, Android Studio, Docker, Vercel, Render, Netlify, MySQL Workbench
- Industry Certifications:
  • PCAP: Programming Essentials in Python (Cisco Networking Academy & OpenEDG Python Institute, July 2024)
  • Introduction to Cybersecurity (Cisco Networking Academy, June 2025)
  • SWOC 2026 – Certificate of Appreciation (2026)
- Featured Projects:
  1. PraGo - AI Powered Medical Super App: Multi-tenant microservices healthcare platform with Dr. PraGo multimodal AI clinical triage (Groq & Gemini Vision), Central API Gateway, 3 role-based portals (Patient, Doctor, Admin), Strangler Fig architecture, tamper-proof Razorpay checkout, zero-IDOR encrypted medical vaults, real-time emergency SOS geo-dispatching, Docker. (Live: https://prago-medical.vercel.app/ | GitHub: https://github.com/indrajitkumar23541-a11y/PraGo-Medical-App)
  2. Indra-MarketMind: Real-Time Quantitative AI Market Intelligence Terminal. 5-model NLP sentiment ensemble (FinBERT, RoBERTa, FinGPT), hybrid Prophet + PyTorch Bi-LSTM price forecaster with Monte Carlo risk cones, 19 global exchange session radar, 10-microservice mesh, PostgreSQL 16 + pgvector, Redis 7, sub-100ms Vercel Edge caching, CyberShield security, automated paper trading with Kelly Criterion risk controls. (Live: https://indra-marketmind.vercel.app/ | GitHub: https://github.com/indrajitkumar23541-a11y/Indra-MarketMind)
  3. VELOCITY X — 3D Cyber Highway Racing & Pursuit Game: Console-grade 3D WebGL highway pursuit racing engine featuring PBR automotive clearcoats, 8-wave staggered slalom traffic AI with 32m lookahead, aggressive state police interceptors with physical PIT maneuvers, procedural Web Audio synthesizer, locked 60–120 FPS envelope via pre-allocated object pooling, instanced mesh draw-calls (<45 calls), 20Hz-throttled React telemetry bridge, sub-250KB distribution. (Live: https://indrajitkumar23541-a11y.github.io/VELOCITY-X/ | GitHub: https://github.com/indrajitkumar23541-a11y/VELOCITY-X)
  4. Yaadon Ki Duniya — Interactive Audio-Visual Indian Nostalgia Platform: 90s Indian nostalgic streaming platform, 6-environment ambient soundscape engine, zero-latency procedural Web Audio synthesizer, analog 88.5–107.9 MHz FM radio tuner, proprietary mathematical 2:1 interleaved playback algorithm balancing 700+ song catalog, dynamic dual-layer audio mixer, sub-300ms stream error recovery, HTML5 Canvas retro postcard generator. (Live: https://indrajitkumar23541-a11y.github.io/Yaadon_Ki_Duniya/ | GitHub: https://github.com/indrajitkumar23541-a11y/Yaadon_Ki_Duniya)
- Hiring Availability:
  • Actively seeking Software Engineering Internships & Entry-Level Software Engineer roles.
  • Work Preference: On-site / Remote.
  • Location: Jaipur, Rajasthan, India (Open to relocation & remote roles worldwide).
  • Languages: Hindi, English.
- Contact Information & Official Links:
  • Email: indrajitkumar23541@gmail.com
  • Phone: +91-7061661897
  • Resume: assets/docs/Indrajit_Kumar_Resume.pdf (ATS-compliant 1-page PDF format)
  • GitHub: https://github.com/indrajitkumar23541-a11y
  • LinkedIn: https://www.linkedin.com/in/indrajit-kumar-221284218/
  • LeetCode: https://leetcode.com/u/indrajitkumar23541/
  • X (Twitter): https://x.com/INDRAJI58504547
  • Instagram: https://www.instagram.com/tech_arcane.wizard/
  • Facebook: https://www.facebook.com/profile.php?id=100067908091448
  • Wikidata: https://www.wikidata.org/wiki/Q141880541

RESPONSE GUIDELINES:
- Be concise, professional, warm, and recruiter-focused.
- Multilingual Support: You are fluent in both English and Hindi/Hinglish. If a user asks questions in Hindi or Hinglish (e.g. "Indrajit ke baare me batao", "Indrajit kaun hai?", "Kya projects banaye hain?", "Kaise sampark kare?"), respond naturally and professionally in conversational Hindi/Hinglish or English with complete clarity!
- If asked for Indrajit's resume or CV, provide a friendly direct link to view and download his verified resume PDF: [Indrajit_Kumar_Resume.pdf](assets/docs/Indrajit_Kumar_Resume.pdf).
- Highlight Indrajit's builder mindset, problem-solving skills, and ability to build end-to-end working applications.
- Keep answers under 3-4 sentences or short, easily scannable bullet points.
- Format responses cleanly using standard markdown (bold **text**, bullet lists, and links [label](url)).
- If asked unrelated questions, briefly answer then pivot back to Indrajit's engineering capabilities.`;

    const conversationHistory = [
        { role: 'system', content: INDRAJIT_SYSTEM_PROMPT }
    ];

    const fallbackKnowledgeBase = {
        intro: `<strong>Indrajit Kumar:</strong> Software Engineer & Full-Stack AI Systems Developer pursuing B.Tech Computer Science (2023–2027) at Jagannath University, Jaipur, Rajasthan, India.
        <ul>
            <li><strong>Core Domain:</strong> Scalable Full-Stack Web Development, Microservices Backend, and Generative AI (LLMs, RAG).</li>
            <li><strong>Flagship Projects:</strong> PraGo (Healthcare AI Super App), Indra-MarketMind (Quantitative Financial AI Terminal), VELOCITY X (3D WebGL Engine), Yaadon Ki Duniya.</li>
            <li><strong>Key Tech:</strong> C++, Python, JavaScript, React, Next.js, Node.js, FastAPI, PostgreSQL, MongoDB, Docker, Groq.</li>
        </ul>
        <div class="fallback-action-group">
            <a href="assets/docs/Indrajit_Kumar_Resume.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                <i class="fa-regular fa-file-pdf"></i> View Resume PDF
            </a>
            <a href="index.html#projects" class="btn btn-sm btn-outline">
                Explore Projects
            </a>
        </div>`,
        education: `<strong>Education & Academics:</strong>
        <ul>
            <li><strong>Degree:</strong> Bachelor of Technology (B.Tech) in Computer Science & Engineering (2023 – Expected 2027)</li>
            <li><strong>University:</strong> Jagannath University, Jaipur, Rajasthan, India (First Class Division Track)</li>
            <li><strong>Core Coursework:</strong> Data Structures & Algorithms (C++), Operating Systems, DBMS, Computer Networks, OOP, AI & Machine Learning.</li>
            <li><strong>Certifications:</strong> PCAP: Programming Essentials in Python (Cisco & Python Institute), Cybersecurity (Cisco), SWOC 2026.</li>
        </ul>`,
        resume: `<strong>Official Verified Resume:</strong> Indrajit's latest ATS-compliant resume (updated 2026) is available:
        <div class="fallback-action-group">
            <a href="assets/docs/Indrajit_Kumar_Resume.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                <i class="fa-regular fa-file-pdf"></i> View Resume PDF
            </a>
            <a href="assets/docs/Indrajit_Kumar_Resume.pdf" download="Indrajit_Kumar_Resume.pdf" class="btn btn-sm btn-outline">
                <i class="fa-solid fa-download"></i> Download PDF
            </a>
        </div>`,
        specialty: `<strong>Core Specialty:</strong> Software Engineer specializing in <strong>Full-Stack Development (React, Next.js, Node.js, FastAPI)</strong> and <strong>AI Systems Integration (Market Sentiment NLP, Healthcare AI, 3D WebGL Engines)</strong>. B.Tech Computer Science student at Jagannath University, Jaipur, graduating in 2027. Strong focus on backend architecture, database systems, and C++ Data Structures & Algorithms.`,
        ai: `<strong>AI & Systems Depth:</strong> Indrajit builds practical AI and web systems. His stack includes:
        <ul>
            <li><strong>Financial Sentiment NLP:</strong> Correlating live financial news sentiment with stock price volatility & trend signals (Indra-MarketMind).</li>
            <li><strong>Healthcare AI Systems:</strong> AI diagnostics, patient telemetry & microservice routing (PraGo Medical App).</li>
            <li><strong>Interactive 3D Engine & AI:</strong> Three.js PBR clearcoats, procedural acoustics & aggressive interceptor AI (VELOCITY-X).</li>
            <li><strong>Cloud & Local LLMs:</strong> Groq API, Ollama, vector search, RAG pipelines, Gemini API, and prompt engineering.</li>
        </ul>`,
        availability: `<strong>Hiring Status:</strong> 🟢 <strong>Actively Open for Opportunities!</strong> Indrajit is available for <strong>Software Engineering Internships</strong> and entry-level full-time roles (Remote or On-site in Jaipur/India).`,
        advantages: `<strong>Why Hire Indrajit:</strong>
        <ol>
            <li><strong>Production Execution:</strong> Delivers complete live products like Indra-MarketMind, VELOCITY-X, PraGo, and Yaadon Ki Duniya.</li>
            <li><strong>C++ DSA Foundations:</strong> Strong algorithmic problem-solving and memory/complexity analysis.</li>
            <li><strong>Full-Stack + AI Architecture:</strong> Skilled in React/Next.js, Node.js, microservices, 3D WebGL, and modern AI integrations.</li>
        </ol>`,
        projects: `<strong>Indrajit's Top Featured Projects:</strong>
        <ol>
            <li><strong><a href="https://indra-marketmind.vercel.app/" target="_blank" rel="noopener noreferrer">Indra-MarketMind</a>:</strong> AI-Powered Market Sentiment Intelligence Platform. (<a href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
            <li><strong><a href="https://indrajitkumar23541-a11y.github.io/VELOCITY-X/" target="_blank" rel="noopener noreferrer">VELOCITY-X</a>:</strong> Next-gen 3D WebGL highway pursuit engine with Three.js PBR clearcoats & 60-120 FPS PWA. (<a href="https://github.com/indrajitkumar23541-a11y/VELOCITY-X" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
            <li><strong><a href="https://prago-medical.vercel.app/" target="_blank" rel="noopener noreferrer">PraGo Medical App</a>:</strong> Enterprise AI Healthcare Ecosystem with Patient App, Business Portal & Admin Platform. (<a href="https://github.com/indrajitkumar23541-a11y/PraGo-Medical-App" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
            <li><strong><a href="https://indrajitkumar23541-a11y.github.io/Yaadon_Ki_Duniya/" target="_blank" rel="noopener noreferrer">Yaadon Ki Duniya</a>:</strong> Nostalgic web experience bringing old Indian memories to life through music and ambient soundscapes. (<a href="https://github.com/indrajitkumar23541-a11y/Yaadon_Ki_Duniya" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
        </ol>`,
        contact: `<strong>Get in Touch:</strong>
        • Email: <a href="mailto:indrajitkumar23541@gmail.com">indrajitkumar23541@gmail.com</a>
        • Phone: <a href="tel:+917061661897">+91-7061661897</a>
        • Resume: <a href="assets/docs/Indrajit_Kumar_Resume.pdf" target="_blank">Download Resume PDF</a>
        • GitHub: <a href="https://github.com/indrajitkumar23541-a11y" target="_blank" rel="noopener noreferrer">github.com/indrajitkumar23541-a11y</a>
        • LinkedIn: <a href="https://www.linkedin.com/in/indrajit-kumar-221284218" target="_blank" rel="noopener noreferrer">linkedin.com/in/indrajit-kumar-221284218</a>
        • LeetCode: <a href="https://leetcode.com/u/indrajitkumar23541/" target="_blank" rel="noopener noreferrer">leetcode.com/u/indrajitkumar23541</a>
        • Location: Jaipur, Rajasthan, India.`
    };

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function sanitizeHtml(html) {
        if (!html) return '';
        const template = document.createElement('template');
        template.innerHTML = html;
        const allowedTags = new Set(['STRONG', 'EM', 'B', 'I', 'CODE', 'PRE', 'UL', 'OL', 'LI', 'P', 'BR', 'A', 'DIV', 'SPAN']);
        const allowedAttrs = {
            'A': ['href', 'target', 'rel', 'class'],
            'UL': ['class'],
            'OL': ['class'],
            'LI': ['class'],
            'P': ['class'],
            'SPAN': ['class'],
            'DIV': ['class'],
            'CODE': ['class'],
            'PRE': ['class']
        };

        function cleanNode(node) {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const tagName = child.tagName.toUpperCase();
                    if (!allowedTags.has(tagName)) {
                        const textNode = document.createTextNode(child.textContent);
                        node.replaceChild(textNode, child);
                        continue;
                    }

                    const attrs = Array.from(child.attributes);
                    const allowedForTag = allowedAttrs[tagName] || [];
                    for (const attr of attrs) {
                        const attrName = attr.name.toLowerCase();
                        if (!allowedForTag.includes(attrName) || attrName.startsWith('on') || attrName === 'style') {
                            child.removeAttribute(attr.name);
                        }
                    }

                    if (tagName === 'A' && child.hasAttribute('href')) {
                        const href = child.getAttribute('href').trim().toLowerCase();
                        if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('#') && !href.startsWith('assets/')) {
                            child.removeAttribute('href');
                        } else if (href.startsWith('http://') || href.startsWith('https://')) {
                            child.setAttribute('target', '_blank');
                            child.setAttribute('rel', 'noopener noreferrer');
                        } else if (href.startsWith('assets/')) {
                            child.setAttribute('target', '_blank');
                        }
                    }

                    cleanNode(child);
                }
            }
        }

        cleanNode(template.content);
        return template.innerHTML;
    }

    function markdownToHtml(text) {
        if (!text) return '';

        let sanitizedText = text
            .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '[Image: $1]')
            .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<\/?(?:p|div|span|em|strong|b|i)[^>]*>/gi, '');

        function formatInline(str) {
            if (!str) return '';
            const codeMap = [];
            let s = str.replace(/`([^`]+)`/g, (_, code) => {
                codeMap.push(`<code>${escapeHtml(code)}</code>`);
                return `@@CODE_${codeMap.length - 1}@@`;
            });

            s = escapeHtml(s);

            s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|assets\/|mailto:|\/)[^\s\)]+)\)/g, (match, linkText, url) => {
                const isExternal = url.startsWith('http://') || url.startsWith('https://');
                return `<a href="${url}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : 'target="_blank"'}>${linkText}</a>`;
            });

            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
            s = s.replace(/(?:^|\s)\*([^*\s][^*]*[^*\s]|[^*\s])\*(?=\s|$|[.,!?;:])/g, (match, p1) => {
                return match.replace(`*${p1}*`, `<em>${p1}</em>`);
            });

            codeMap.forEach((c, idx) => {
                s = s.replace(`@@CODE_${idx}@@`, c);
            });

            return s;
        }

        const lines = sanitizedText.split('\n');
        let inList = false;
        const outputLines = [];

        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const trimmed = rawLine.trim();

            if (!trimmed) {
                if (inList) {
                    inList = false;
                    outputLines.push('</ul>');
                }
                continue;
            }

            const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+[\.\)]\s/.test(trimmed);

            if (isBullet) {
                if (!inList) {
                    inList = true;
                    outputLines.push('<ul>');
                }
                const bulletContent = trimmed.replace(/^[\*\-]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
                outputLines.push(`<li>${formatInline(bulletContent)}</li>`);
            } else {
                if (inList) {
                    inList = false;
                    outputLines.push('</ul>');
                }
                outputLines.push(`<p>${formatInline(trimmed)}</p>`);
            }
        }

        if (inList) {
            outputLines.push('</ul>');
        }

        return sanitizeHtml(outputLines.join('\n'));
    }

    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    function appendMessage(sender, content, isUser = false) {
        if (!aiMessages) return;
        const bubble = document.createElement('div');
        bubble.className = `ai-bubble ${isUser ? 'user-bubble' : 'bot-bubble'} wa-bubble`;
        const timeStr = getCurrentTime();
        
        if (!isUser) {
            const safeHtml = sanitizeHtml(content);
            bubble.innerHTML = `
                <div class="bubble-sender">
                    <img src="assets/images/ai_intel_avatar.webp" alt="IndraIntel" class="bubble-sender-avatar" width="20" height="20">
                    <span>${escapeHtml(sender)}</span>
                </div>
                <div class="bubble-content">${safeHtml}</div>
                <div class="wa-msg-meta">
                    <span class="wa-msg-time">${timeStr}</span>
                </div>
            `;
        } else {
            const userContentDiv = document.createElement('div');
            userContentDiv.className = 'user-bubble-text';
            userContentDiv.textContent = content;
            bubble.appendChild(userContentDiv);

            const metaDiv = document.createElement('div');
            metaDiv.className = 'wa-msg-meta wa-user-meta';
            metaDiv.innerHTML = `
                <span class="wa-msg-time">${timeStr}</span>
                <span class="wa-double-check" title="Delivered & Read"><i class="fa-solid fa-check-double"></i></span>
            `;
            bubble.appendChild(metaDiv);
        }

        aiMessages.appendChild(bubble);
        scrollToBottom();
    }

    function scrollToBottom() {
        if (aiMessages) {
            aiMessages.scrollTop = aiMessages.scrollHeight;
        }
    }

    function showTypingIndicator() {
        if (!aiMessages) return null;
        const typingEl = document.createElement('div');
        typingEl.className = 'typing-bubble';
        typingEl.id = 'ai-typing-indicator';
        typingEl.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        aiMessages.appendChild(typingEl);
        scrollToBottom();
        return typingEl;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('ai-typing-indicator');
        if (el) el.remove();
    }

    async function queryGroqApi(userQuery) {
        conversationHistory.push({ role: 'user', content: userQuery });
        const boundedHistory = [
            conversationHistory[0],
            ...conversationHistory.slice(1).slice(-12)
        ];

        let serverlessRes = null;
        try {
            serverlessRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: boundedHistory })
            });
        } catch {
            serverlessRes = null;
        }

        if (serverlessRes) {
            if (serverlessRes.ok) {
                const data = await serverlessRes.json().catch(() => ({}));
                const botReply = data.choices?.[0]?.message?.content;
                if (botReply && typeof botReply === 'string' && botReply.trim()) {
                    conversationHistory.push({ role: 'assistant', content: botReply });
                    return markdownToHtml(botReply);
                }
            } else {
                const clientKey = localStorage.getItem('GROQ_API_KEY') || GROQ_CONFIG.apiKey;
                if (!clientKey) {
                    return fallbackQueryHandler(userQuery);
                }
            }
        }

        const activeKey = localStorage.getItem('GROQ_API_KEY') || GROQ_CONFIG.apiKey;
        if (activeKey) {
            const response = await fetch(GROQ_CONFIG.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${activeKey}`
                },
                body: JSON.stringify({
                    model: GROQ_CONFIG.model,
                    messages: boundedHistory,
                    temperature: 0.6,
                    max_tokens: 450
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Groq API Error (${response.status})`);
            }

            const data = await response.json();
            const botReply = data.choices?.[0]?.message?.content;
            conversationHistory.push({ role: 'assistant', content: botReply });
            return markdownToHtml(botReply);
        }

        return fallbackQueryHandler(userQuery);
    }

    function fallbackQueryHandler(queryText) {
        const lower = queryText.toLowerCase();
        return new Promise((resolve) => {
            setTimeout(() => {
                let answer = '';
                if (lower.includes('resume') || lower.includes('cv') || lower.includes('biodata') || lower.includes('pdf')) {
                    answer = fallbackKnowledgeBase.resume;
                } else if (lower.includes('kon hai') || lower.includes('kaun hai') || lower.includes('who is') || lower.includes('about') || lower.includes('intro') || lower.includes('bare me') || lower.includes('baare me') || lower.includes('batao') || lower.includes('tell me about')) {
                    answer = fallbackKnowledgeBase.intro;
                } else if (lower.includes('education') || lower.includes('college') || lower.includes('university') || lower.includes('padhai') || lower.includes('degree') || lower.includes('b.tech') || lower.includes('jagannath')) {
                    answer = fallbackKnowledgeBase.education;
                } else if (lower.includes('specialty') || lower.includes('stack') || lower.includes('skills') || lower.includes('technical') || lower.includes('kya aata hai') || lower.includes('languages')) {
                    answer = fallbackKnowledgeBase.specialty;
                } else if (lower.includes('ai') || lower.includes('llm') || lower.includes('rag') || lower.includes('gemini') || lower.includes('groq')) {
                    answer = fallbackKnowledgeBase.ai;
                } else if (lower.includes('available') || lower.includes('internship') || lower.includes('job') || lower.includes('hire') || lower.includes('role') || lower.includes('naukri')) {
                    answer = fallbackKnowledgeBase.availability;
                } else if (lower.includes('stand out') || lower.includes('fresher') || lower.includes('why') || lower.includes('advantages')) {
                    answer = fallbackKnowledgeBase.advantages;
                } else if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio') || lower.includes('prago') || lower.includes('marketmind') || lower.includes('velocity') || lower.includes('kya banaya')) {
                    answer = fallbackKnowledgeBase.projects;
                } else if (lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('phone') || lower.includes('number') || lower.includes('sampark') || lower.includes('call')) {
                    answer = fallbackKnowledgeBase.contact;
                } else {
                    answer = `Thank you for asking! Indrajit specializes in <strong>Full-Stack Development (React, Next.js, Node.js, FastAPI)</strong> and <strong>AI Integrations (Groq, Llama 3, Gemini, RAG)</strong>. He is pursuing B.Tech CSE (2023–2027) at Jagannath University and is actively open for software engineering internships and roles. You can <a href="assets/docs/Indrajit_Kumar_Resume.pdf" target="_blank" style="color: var(--coffee-primary); text-decoration: underline;">view his resume</a> or reach him at <a href="mailto:indrajitkumar23541@gmail.com" style="color: var(--coffee-primary); text-decoration: underline;">indrajitkumar23541@gmail.com</a>.`;
                }
                resolve(answer);
            }, 300);
        });
    }

    async function handleUserInteraction(queryText) {
        showTypingIndicator();
        try {
            const botHtml = await queryGroqApi(queryText);
            removeTypingIndicator();
            appendMessage("IndraIntel · Candidate Copilot", botHtml);
        } catch (err) {
            removeTypingIndicator();
            console.error('AI query error:', err);
            appendMessage(
                "IndraIntel · Candidate Copilot",
                `⚠️ <em>IndraIntel is currently in offline mode.</em><br><br>${fallbackKnowledgeBase.specialty}`
            );
        }
    }

    if (aiForm && aiInput) {
        aiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = aiInput.value.trim();
            if (!text) return;
            aiInput.value = '';
            appendMessage('You', text, true);
            await handleUserInteraction(text);
        });
    }

    if (promptChips.length > 0) {
        promptChips.forEach(chip => {
            chip.addEventListener('click', async () => {
                const query = chip.getAttribute('data-query');
                if (!query) return;
                appendMessage('You', query, true);
                await handleUserInteraction(query);
            });
        });
    }

    if (btnClearChat) {
        btnClearChat.addEventListener('click', () => {
            if (aiMessages) {
                aiMessages.innerHTML = `
                    <div class="ai-bubble bot-bubble">
                        <div class="bubble-sender">
                            <img src="assets/images/ai_intel_avatar.webp" alt="IndraIntel" class="bubble-sender-avatar" width="22" height="22">
                            <span>IndraIntel · Candidate Copilot</span>
                        </div>
                        <div class="bubble-content">
                            <p>Conversation restarted! I am ready to answer any questions about <strong>Indrajit Kumar</strong>.</p>
                        </div>
                    </div>
                `;
                conversationHistory.length = 1; // Keep system prompt
            }
        });
    }

    // Auto-focus input
    if (aiInput) {
        aiInput.focus();
    }
});
