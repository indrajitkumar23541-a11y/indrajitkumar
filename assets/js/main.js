/**
 * INDRAJIT KUMAR — PORTFOLIO INTERACTIONS
 * Handles navbar, skills filtering, 1-click clipboard, AI dossier, and contact form
 */

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------------------
       1. NAVBAR SCROLL & MOBILE TOGGLE
       ------------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile nav when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    /* -------------------------------------------------------------------------
       2. ACTIVE NAV LINK HIGHLIGHT VIA INTERSECTION OBSERVER
       ------------------------------------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links .nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    if (item.getAttribute('href') === `#${currentId}`) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    /* -------------------------------------------------------------------------
       3. SKILLS CATEGORY FILTER
       ------------------------------------------------------------------------- */
    const filterTabs = document.querySelectorAll('.filter-tab');
    const skillCards = document.querySelectorAll('.skill-category-card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            skillCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.35s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* -------------------------------------------------------------------------
       4. 1-CLICK CLIPBOARD COPY (EMAIL) WITH TOAST NOTIFICATION
       ------------------------------------------------------------------------- */
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    function showToast(message) {
        if (!toast) return;
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    // Hero Quick Copy Button
    const quickCopyBtn = document.getElementById('quick-copy-email');
    if (quickCopyBtn) {
        quickCopyBtn.addEventListener('click', () => {
            const email = quickCopyBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                const textSpan = quickCopyBtn.querySelector('.copy-text');
                const origText = textSpan.textContent;
                textSpan.textContent = 'Copied!';
                quickCopyBtn.style.borderColor = 'var(--coffee-primary)';
                showToast(`Email copied: ${email}`);

                setTimeout(() => {
                    textSpan.textContent = origText;
                    quickCopyBtn.style.borderColor = '';
                }, 2000);
            }).catch(() => {
                showToast('Email: indrajitkumar23541@gmail.com');
            });
        });
    }

    // Contact Channel Mini Copy Buttons
    const miniCopyButtons = document.querySelectorAll('.btn-copy-mini');
    miniCopyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const copyText = btn.getAttribute('data-copy');
            if (copyText) {
                navigator.clipboard.writeText(copyText).then(() => {
                    showToast(`Copied to clipboard: ${copyText}`);
                });
            }
        });
    });

    /* -------------------------------------------------------------------------
       5. INTERACTIVE AI ASSISTANT (POWERED BY GROQ CLOUD · LLAMA 3.3)
       ------------------------------------------------------------------------- */
    const aiMessages = document.getElementById('ai-messages');
    const aiForm = document.getElementById('ai-form');
    const aiInput = document.getElementById('ai-user-input');
    const promptChips = document.querySelectorAll('.prompt-chip');

    // GROQ API CONFIGURATION
    // For local dev or Vercel, API calls go through secure serverless proxy /api/chat
    // Users can also optionally provide a temporary client-side key via UI prompt
    const GROQ_CONFIG = {
        apiKey: '',
        model: 'qwen/qwen3.8-27b',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions'
    };

    // Comprehensive context for Groq Llama 3.3
    const INDRAJIT_SYSTEM_PROMPT = `You are the personal AI Assistant for Indrajit Kumar, integrated into his developer portfolio.
Your role is to answer questions from recruiters, hiring managers, and engineers about Indrajit's technical skills, projects, background, and hiring availability.

VERIFIED DOSSIER ON INDRAJIT KUMAR:
- Full Name: Indrajit Kumar
- Professional Identity: Software Engineer | Full-Stack Development & AI Integration
- Education: B.Tech in Computer Science & Engineering (2023 – Expected June 2027) at Jagannath University, Jaipur, India.
- Technical Specialization: Full-Stack Web Development, Backend Architecture, Database Systems & AI/LLM Integration.
- Technical Stack:
  • Frontend: React.js, Next.js, HTML5, CSS3, JavaScript (ES6+), TypeScript, Tailwind CSS
  • Backend: Node.js, Express.js, FastAPI, Python, Django, REST APIs, WebSockets
  • Databases: PostgreSQL, MongoDB, SQL, Vector Databases
  • AI & GenAI: Groq API, Ollama, Llama 3, Google Gemini API, RAG (Retrieval-Augmented Generation), Prompt Engineering, Semantic Embeddings, Computer Vision
  • Core Fundamentals: C++, Data Structures & Algorithms (DSA), OOP, DBMS, OS, System Design basics
- Featured Projects:
  1. Indra-MarketMind: AI-Powered Market Sentiment Intelligence Platform. Correlating live financial news sentiment with stock price volatility to emit real-time market trend signals. (Live: https://indra-marketmind.vercel.app/ | GitHub: https://github.com/indrajitkumar23541-a11y/Indra-MarketMind)
  2. VELOCITY-X: Next-generation 3D WebGL highway pursuit engine engineered with Three.js PBR automotive clearcoats, real-time procedural acoustics, aggressive interceptor AI, locked 60–120 FPS envelope, and 100% offline PWA architecture. (Live: https://indrajitkumar23541-a11y.github.io/VELOCITY-X/ | GitHub: https://github.com/indrajitkumar23541-a11y/VELOCITY-X)
  3. PraGo Medical App: Enterprise AI Healthcare Ecosystem featuring Patient App, Business Portal, and Admin Platform built with microservices, AI diagnostics, React, Node.js, and Docker. (Live: https://prago-medical.vercel.app/ | GitHub: https://github.com/indrajitkumar23541-a11y/PraGo-Medical-App)
  4. Yaadon Ki Duniya: A nostalgic web experience bringing old Indian memories to life through music, ambient sounds, and immersive visuals. (Live: https://indrajitkumar23541-a11y.github.io/Yaadon_Ki_Duniya/ | GitHub: https://github.com/indrajitkumar23541-a11y/Yaadon_Ki_Duniya)
- Hiring Availability:
  • Actively seeking Software Engineering Internships & Entry-Level Software Engineer roles.
  • Work Preference: On-site / Remote.
  • Languages: Hindi, English.
- Contact Information:
  • Email: indrajitkumar23541@gmail.com
  • GitHub: https://github.com/indrajitkumar23541-a11y
  • LinkedIn: https://www.linkedin.com/in/indrajit-kumar-221284218
  • LeetCode: https://leetcode.com/u/indrajitkumar23541/

RESPONSE GUIDELINES:
- Be concise, professional, warm, and recruiter-focused.
- Highlight Indrajit's builder mindset, problem-solving skills, and ability to build end-to-end working applications.
- Keep answers under 3-4 sentences or short, easily scannable bullet points.
- Format responses nicely with HTML tags (<strong>, <em>, <ul>, <li>, <p>).
- If asked unrelated questions, briefly answer then pivot back to Indrajit's engineering capabilities.`;

    // Multi-turn conversation history for Groq
    const conversationHistory = [
        { role: 'system', content: INDRAJIT_SYSTEM_PROMPT }
    ];

    // Fallback knowledge base if no API key is configured yet
    const fallbackKnowledgeBase = {
        specialty: `<strong>Core Specialty:</strong> Software Engineer specializing in <strong>Full-Stack Development (React, Next.js, Node.js, FastAPI)</strong> and <strong>AI Systems Integration (Market Sentiment NLP, Healthcare AI, 3D WebGL Engines)</strong>. B.Tech Computer Science student at Jagannath University, Jaipur, graduating in 2027. Strong focus on backend architecture, database systems, and C++ Data Structures & Algorithms.`,
        ai: `<strong>AI & Systems Depth:</strong> Indrajit builds practical AI and web systems. His stack includes:
        <ul style="margin: 0.5rem 0 0 1.25rem; line-height: 1.5;">
            <li><strong>Financial Sentiment NLP:</strong> Correlating live financial news sentiment with stock price volatility & trend signals (Indra-MarketMind).</li>
            <li><strong>Healthcare AI Systems:</strong> AI diagnostics, patient telemetry & microservice routing (PraGo Medical App).</li>
            <li><strong>Interactive 3D Engine & AI:</strong> Three.js PBR clearcoats, procedural acoustics & aggressive interceptor AI (VELOCITY-X).</li>
            <li><strong>Cloud & Local LLMs:</strong> Groq API (Llama 3.3 70B), Ollama, vector search, RAG pipelines, and prompt engineering.</li>
        </ul>`,
        availability: `<strong>Hiring Status:</strong> 🟢 <strong>Actively Open for Opportunities!</strong> Indrajit is available for <strong>Software Engineering Internships</strong> and entry-level full-time roles (Remote or On-site).`,
        advantages: `<strong>Why Hire Indrajit:</strong>
        <ol style="margin: 0.5rem 0 0 1.25rem; line-height: 1.5;">
            <li><strong>Production Execution:</strong> Delivers complete live products like Indra-MarketMind, VELOCITY-X, PraGo, and Yaadon Ki Duniya.</li>
            <li><strong>C++ DSA Foundations:</strong> Strong algorithmic problem-solving and memory/complexity analysis.</li>
            <li><strong>Full-Stack + AI Architecture:</strong> Skilled in React/Next.js, Node.js, microservices, 3D WebGL, and modern AI integrations.</li>
        </ol>`,
        projects: `<strong>Indrajit's Top Featured Projects:</strong>
        <ol style="margin: 0.5rem 0 0 1.25rem; line-height: 1.6;">
            <li><strong><a href="https://indra-marketmind.vercel.app/" target="_blank" rel="noopener noreferrer" style="color: var(--coffee-primary); text-decoration: underline;">Indra-MarketMind</a>:</strong> AI-Powered Market Sentiment Intelligence Platform. (<a href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
            <li><strong><a href="https://indrajitkumar23541-a11y.github.io/VELOCITY-X/" target="_blank" rel="noopener noreferrer" style="color: var(--coffee-primary); text-decoration: underline;">VELOCITY-X</a>:</strong> Next-gen 3D WebGL highway pursuit engine with Three.js PBR clearcoats & 60-120 FPS PWA. (<a href="https://github.com/indrajitkumar23541-a11y/VELOCITY-X" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
            <li><strong><a href="https://prago-medical.vercel.app/" target="_blank" rel="noopener noreferrer" style="color: var(--coffee-primary); text-decoration: underline;">PraGo Medical App</a>:</strong> Enterprise AI Healthcare Ecosystem with Patient App, Business Portal & Admin Platform. (<a href="https://github.com/indrajitkumar23541-a11y/PraGo-Medical-App" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
            <li><strong><a href="https://indrajitkumar23541-a11y.github.io/Yaadon_Ki_Duniya/" target="_blank" rel="noopener noreferrer" style="color: var(--coffee-primary); text-decoration: underline;">Yaadon Ki Duniya</a>:</strong> Nostalgic web experience bringing old Indian memories to life through music and ambient soundscapes. (<a href="https://github.com/indrajitkumar23541-a11y/Yaadon_Ki_Duniya" target="_blank" rel="noopener noreferrer">GitHub</a>)</li>
        </ol>`,
        contact: `<strong>Get in Touch:</strong>
        • Email: <a href="mailto:indrajitkumar23541@gmail.com" style="color: var(--coffee-primary); text-decoration: underline;">indrajitkumar23541@gmail.com</a>
        • GitHub: <a href="https://github.com/indrajitkumar23541-a11y" target="_blank" rel="noopener noreferrer" style="color: var(--coffee-primary); text-decoration: underline;">github.com/indrajitkumar23541-a11y</a>
        • LinkedIn: <a href="https://www.linkedin.com/in/indrajit-kumar-221284218" target="_blank" rel="noopener noreferrer" style="color: var(--coffee-primary); text-decoration: underline;">linkedin.com/in/indrajit-kumar-221284218</a>
        • LeetCode: <a href="https://leetcode.com/u/indrajitkumar23541/" target="_blank" rel="noopener noreferrer" style="color: var(--coffee-primary); text-decoration: underline;">leetcode.com/u/indrajitkumar23541</a>
        • Education: B.Tech Computer Science (2023–2027), Jagannath University, Jaipur.`
    };

    function appendMessage(sender, htmlContent, isUser = false) {
        if (!aiMessages) return;
        const bubble = document.createElement('div');
        bubble.className = `ai-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`;
        
        if (!isUser) {
            bubble.innerHTML = `<div class="bubble-sender"><img src="assets/images/ai_intel_avatar.jpg" alt="IndraIntel" class="bubble-sender-avatar"><span>${sender}</span></div><div>${htmlContent}</div>`;
        } else {
            bubble.innerHTML = `<div>${htmlContent}</div>`;
        }

        aiMessages.appendChild(bubble);
        aiMessages.scrollTop = aiMessages.scrollHeight;
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
        aiMessages.scrollTop = aiMessages.scrollHeight;
        return typingEl;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('ai-typing-indicator');
        if (el) el.remove();
    }

    // UI Elements for API Key Management & Status
    const btnConfigureKey = document.getElementById('btn-configure-key');
    const keyBtnLabel = document.getElementById('key-btn-label');
    const aiStatusText = document.getElementById('ai-status-text');
    let isServerlessBackendAvailable = false;

    function updateApiKeyUi() {
        if (isServerlessBackendAvailable) {
            if (aiStatusText) aiStatusText.textContent = 'Groq Live · Llama 3.3';
            if (keyBtnLabel) keyBtnLabel.textContent = 'Secure Proxy Active';
            if (btnConfigureKey) {
                btnConfigureKey.classList.add('connected');
                btnConfigureKey.title = 'Running securely via Vercel Serverless Proxy';
            }
            return;
        }

        const activeKey = localStorage.getItem('GROQ_API_KEY') || GROQ_CONFIG.apiKey;
        if (activeKey && activeKey.startsWith('gsk_')) {
            if (aiStatusText) aiStatusText.textContent = 'Groq Live · AI Intel';
            if (keyBtnLabel) keyBtnLabel.textContent = 'Key Active';
            if (btnConfigureKey) btnConfigureKey.classList.add('connected');
        } else {
            if (aiStatusText) aiStatusText.textContent = 'Groq Cloud · AI Intel';
            if (keyBtnLabel) keyBtnLabel.textContent = 'Connect Key';
            if (btnConfigureKey) btnConfigureKey.classList.remove('connected');
        }
    }

    async function checkBackendAvailability() {
        try {
            // Check if Vercel serverless /api/chat is reachable
            const res = await fetch('/api/chat', { method: 'GET' });
            if (res.status === 405 || res.status === 200) {
                isServerlessBackendAvailable = true;
                updateApiKeyUi();
            }
        } catch {
            isServerlessBackendAvailable = false;
            updateApiKeyUi();
        }
    }

    if (btnConfigureKey) {
        btnConfigureKey.addEventListener('click', () => {
            const existingKey = localStorage.getItem('GROQ_API_KEY') || GROQ_CONFIG.apiKey || '';
            const promptMessage = isServerlessBackendAvailable
                ? "Your portfolio is connected to Vercel Secure Serverless Proxy!\n\nIf you wish to test with a custom client-side key, enter it below (starts with 'gsk_'):\n(Or leave blank to use the secure server environment variable):"
                : "Enter your Groq Cloud API Key (starts with 'gsk_'):\n\nGet your free key at: https://console.groq.com/keys\n\n(Leave blank and press OK to use offline knowledge base):";

            const userKey = prompt(promptMessage, existingKey);
            if (userKey === null) return; // user cancelled

            const cleanKey = userKey.trim();
            if (cleanKey === '') {
                localStorage.removeItem('GROQ_API_KEY');
                updateApiKeyUi();
                if (!isServerlessBackendAvailable) {
                    appendMessage("Indrajit's AI Assistant", "ℹ️ <em>Groq API Key removed. Assistant is now using the offline verified portfolio knowledge base.</em>");
                } else {
                    appendMessage("Indrajit's AI Assistant", "ℹ️ <em>Now using secure Vercel serverless proxy with your server environment key.</em>");
                }
            } else if (cleanKey.startsWith('gsk_')) {
                localStorage.setItem('GROQ_API_KEY', cleanKey);
                updateApiKeyUi();
                appendMessage("Indrajit's AI Assistant", `✅ <strong>Groq API Key connected successfully!</strong> Now running live <strong>Llama 3.3 (70B)</strong>. Ask me anything about Indrajit!`);
            } else {
                alert("Invalid key format. Groq API keys start with 'gsk_'. Please check console.groq.com/keys.");
            }
        });
    }

    // Initialize UI status on load
    updateApiKeyUi();
    checkBackendAvailability();

    function markdownToHtml(text) {
        const lines = text.split('\n');
        let inList = false;
        let processedLines = [];

        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
                if (!inList) {
                    inList = true;
                    processedLines.push('<ul style="margin: 0.4rem 0 0.4rem 1.25rem; line-height: 1.55;">');
                }
                const bulletContent = trimmed.replace(/^[\*\-]\s+/, '').replace(/^\d+\.\s+/, '');
                processedLines.push(`<li>${bulletContent}</li>`);
            } else {
                if (inList) {
                    inList = false;
                    processedLines.push('</ul>');
                }
                processedLines.push(line);
            }
        }
        if (inList) {
            processedLines.push('</ul>');
        }

        let html = processedLines.join('\n')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
        return html;
    }

    async function queryGroqApi(userQuery) {
        conversationHistory.push({ role: 'user', content: userQuery });

        // 1. Attempt Vercel Serverless Backend Proxy (/api/chat)
        try {
            const serverlessRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory })
            });

            if (serverlessRes.ok) {
                const data = await serverlessRes.json();
                const botReply = data.choices?.[0]?.message?.content;
                if (botReply) {
                    conversationHistory.push({ role: 'assistant', content: botReply });
                    return markdownToHtml(botReply);
                }
            } else if (serverlessRes.status !== 404 && serverlessRes.status !== 405 && serverlessRes.status !== 501) {
                const errData = await serverlessRes.json().catch(() => ({}));
                if (errData.error && errData.error.includes('GROQ_API_KEY')) {
                    throw new Error(errData.error);
                }
            }
        } catch (err) {
            if (err.message && err.message.includes('GROQ_API_KEY')) {
                throw err;
            }
            // Serverless endpoint not present (e.g. running on local python http.server)
        }

        // 2. Client-side key fallback (for local development or custom override)
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
                    messages: conversationHistory,
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

        // 3. Local smart offline fallback if no key is entered
        return fallbackQueryHandler(userQuery);
    }

    function fallbackQueryHandler(queryText) {
        const lower = queryText.toLowerCase();
        return new Promise((resolve) => {
            setTimeout(() => {
                let answer = '';
                if (lower.includes('specialty') || lower.includes('stack') || lower.includes('skills') || lower.includes('technical')) {
                    answer = fallbackKnowledgeBase.specialty;
                } else if (lower.includes('ai') || lower.includes('llm') || lower.includes('rag') || lower.includes('gemini') || lower.includes('groq')) {
                    answer = fallbackKnowledgeBase.ai;
                } else if (lower.includes('available') || lower.includes('internship') || lower.includes('job') || lower.includes('hire') || lower.includes('role')) {
                    answer = fallbackKnowledgeBase.availability;
                } else if (lower.includes('stand out') || lower.includes('fresher') || lower.includes('why') || lower.includes('advantages')) {
                    answer = fallbackKnowledgeBase.advantages;
                } else if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio') || lower.includes('robolens')) {
                    answer = fallbackKnowledgeBase.projects;
                } else if (lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('phone')) {
                    answer = fallbackKnowledgeBase.contact;
                } else {
                    answer = `Thank you for asking! Indrajit specializes in <strong>Full-Stack Development (React, Next.js, Node.js, FastAPI)</strong> and <strong>AI Integrations (Groq, Llama 3, Gemini, RAG)</strong>. He is pursuing B.Tech CSE (2023–2027) at Jagannath University and is actively open for software engineering internships and roles. Contact him at <a href="mailto:indrajitkumar23541@gmail.com" style="color: var(--coffee-primary); text-decoration: underline;">indrajitkumar23541@gmail.com</a>.`;
                }

                resolve(answer);
            }, 300);
        });
    }

    async function handleUserInteraction(queryText) {
        // Allow user to set key directly by typing "set key gsk_..."
        if (queryText.toLowerCase().startsWith('set key ') || queryText.toLowerCase().startsWith('set_key ')) {
            const keyPart = queryText.split(' ')[2]?.trim();
            if (keyPart && keyPart.startsWith('gsk_')) {
                localStorage.setItem('GROQ_API_KEY', keyPart);
                updateApiKeyUi();
                appendMessage("IndraIntel · Candidate Copilot", `✅ <strong>Groq API Key saved successfully!</strong> Now running live with Groq Cloud. Ask me anything!`);
                return;
            } else {
                appendMessage("IndraIntel · Candidate Copilot", `❌ Invalid key format. A valid Groq key starts with <code>gsk_</code>.`);
                return;
            }
        }

        showTypingIndicator();

        try {
            const botHtml = await queryGroqApi(queryText);
            removeTypingIndicator();
            appendMessage("IndraIntel · Candidate Copilot", botHtml);
        } catch (err) {
            removeTypingIndicator();
            console.error('Groq query error:', err);
            appendMessage(
                "IndraIntel · Candidate Copilot",
                `⚠️ <em>Unable to reach Groq Cloud: ${err.message}</em><br><br>Here is the offline summary: ${fallbackKnowledgeBase.specialty}`
            );
        }
    }

    if (aiForm && aiInput) {
        aiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = aiInput.value.trim();
            if (!text) return;

            appendMessage('You', text, true);
            aiInput.value = '';
            handleUserInteraction(text);
        });
    }

    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            if (query) {
                appendMessage('You', query, true);
                handleUserInteraction(query);
            }
        });
    });

    /* -------------------------------------------------------------------------
       6. DIRECT CONTACT FORM WITH LIVE DISPATCH & AUTOMATIC FALLBACK
       ------------------------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('form-submit-btn');

    if (contactForm && formFeedback && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const subjectInput = document.getElementById('contact-subject');
            const messageInput = document.getElementById('contact-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const subject = subjectInput ? subjectInput.value.trim() : 'Portfolio Contact Message';
            const message = messageInput ? messageInput.value.trim() : '';

            // Validation
            if (!name || !email || !message) {
                formFeedback.className = 'form-feedback error';
                formFeedback.textContent = 'Please fill out all required fields (Name, Email, and Message).';
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                formFeedback.className = 'form-feedback error';
                formFeedback.textContent = 'Please provide a valid email address so I can get back to you.';
                if (emailInput) emailInput.focus();
                return;
            }

            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Sending Message...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            submitBtn.disabled = true;
            formFeedback.className = 'form-feedback';
            formFeedback.textContent = '';

            // Set hidden subject field dynamically
            const hiddenSubject = document.getElementById('form-email-subject');
            if (hiddenSubject) {
                hiddenSubject.value = `Portfolio Inquiry from ${name}: ${subject}`;
            }

            const mailtoSubject = encodeURIComponent(`Portfolio Inquiry: ${subject} (from ${name})`);
            const mailtoBody = encodeURIComponent(`Hi Indrajit,\n\nName: ${name}\nEmail: ${email}\nRole / Opportunity: ${subject}\n\nMessage:\n${message}\n\nSent from Portfolio Website`);
            const mailtoUrl = `mailto:indrajitkumar23541@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

            let dispatched = false;

            // Tier 1: Try /api/contact (Vercel Serverless or local server)
            try {
                const apiRes = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message })
                });
                if (apiRes.ok) {
                    const apiData = await apiRes.json().catch(() => ({}));
                    if (apiData.success) {
                        dispatched = true;
                    }
                }
            } catch {
                // Pass through to Tier 2
            }

            // Tier 2: Try FormSubmit.co direct AJAX dispatch (works everywhere, including GitHub Pages)
            if (!dispatched) {
                try {
                    const response = await fetch('https://formsubmit.co/ajax/indrajitkumar23541@gmail.com', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            name: name,
                            email: email,
                            _subject: `Portfolio Inquiry from ${name}: ${subject}`,
                            subject: subject,
                            message: message,
                            _template: 'table',
                            _captcha: 'false'
                        })
                    });

                    const data = await response.json().catch(() => ({}));
                    if (response.ok || data.success === 'true' || data.success === true || (data.message && data.message.includes('Activate'))) {
                        dispatched = true;
                    }
                } catch (formErr) {
                    console.warn('Direct FormSubmit dispatch failed:', formErr);
                }
            }

            // Result Handling
            if (dispatched) {
                submitBtn.innerHTML = `<span>Message Dispatched!</span> <i class="fa-solid fa-check"></i>`;
                submitBtn.style.backgroundColor = 'var(--accent-emerald)';

                formFeedback.className = 'form-feedback success';
                formFeedback.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: center; text-align: center;">
                        <div><i class="fa-solid fa-circle-check"></i> <strong>Thank you, ${name}! Your message has been sent.</strong></div>
                        <div style="font-size: 0.78rem; color: var(--text-mocha);">Inquiry sent to <code>indrajitkumar23541@gmail.com</code>. (If checking for test emails, remember to check your Gmail <strong>Spam / All Mail</strong> folder).</div>
                        <div style="margin-top: 0.25rem;">
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=indrajitkumar23541@gmail.com&su=${mailtoSubject}&body=${mailtoBody}" target="_blank" rel="noopener noreferrer" style="font-size: 0.78rem; font-weight: 600; color: var(--coffee-primary); text-decoration: underline;">
                                <i class="fa-brands fa-google"></i> Also open and send directly via Gmail Web
                            </a>
                        </div>
                    </div>
                `;

                showToast('Message sent to Indrajit successfully!');
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                }, 5000);
            } else {
                // Tier 3: Seamless Mailto Fallback
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;

                formFeedback.className = 'form-feedback error';
                formFeedback.innerHTML = `Network notice: <a href="${mailtoUrl}">Click here to send directly via your Mail app</a> or email directly at <a href="mailto:indrajitkumar23541@gmail.com">indrajitkumar23541@gmail.com</a>.`;

                window.location.href = mailtoUrl;
            }
        });
    }

    /* -------------------------------------------------------------------------
       7. CINEMATIC 3D PARALLAX TILT EFFECT (DESKTOP FINE-POINTER ONLY)
       ------------------------------------------------------------------------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const tiltCards = document.querySelectorAll('.cinematic-tilt, .project-card');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element
                const y = e.clientY - rect.top;  // y position within the element

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -7; // max 7 deg tilt
                const rotateY = ((x - centerX) / centerX) * 7;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease-out';
            });
        });
    }

});

// Simple animation keyframe injected dynamically
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleTag);
