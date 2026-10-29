/**
 * INDRAJIT KUMAR — PORTFOLIO INTERACTIONS
 * Handles navbar, skills filtering, 1-click clipboard, AI dossier, and contact form
 */

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------------------
       0. WORLD-CLASS SMOOTH SCROLL ENGINE (Lenis High-Precision Interpolation)
       ------------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.92,
            touchMultiplier: 1.5,
            infinite: false
        });

        // High-precision RAF loop
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Zero-overhead scroll updates directly from Lenis
        lenis.on('scroll', ({ scroll }) => {
            if (scroll > 25) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    } else {
        // Fallback for native window scroll
        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 25) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }, { passive: true });
    }

    // Universal Ultra-Smooth Anchor Navigation (with A11y Focus & Modified-Click Handling)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Leave modified clicks (Cmd/Ctrl/Shift/Alt/Middle click) to native browser behavior
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }

            const href = this.getAttribute('href');
            if (!href || href === '#' || href === '#!') return;

            // On mobile & tablet, route AI Intel nav link directly to dedicated WhatsApp-style chat page
            if (href === '#ai-assistant' && window.innerWidth <= 991) {
                e.preventDefault();
                window.location.href = 'chat.html';
                return;
            }

            const targetEl = document.querySelector(href);
            if (targetEl) {
                e.preventDefault();

                const setAccessibleFocus = () => {
                    if (!targetEl.hasAttribute('tabindex')) {
                        targetEl.setAttribute('tabindex', '-1');
                    }
                    targetEl.focus({ preventScroll: true });
                };

                if (lenis) {
                    lenis.scrollTo(targetEl, {
                        offset: -75,
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                        onComplete: setAccessibleFocus
                    });
                } else {
                    const top = targetEl.getBoundingClientRect().top + window.scrollY - 75;
                    window.scrollTo({ top, behavior: 'smooth' });
                    setAccessibleFocus();
                }

                // Avoid pushing duplicate fragment to history stack
                if (history.pushState && window.location.hash !== href) {
                    history.pushState(null, null, href);
                }
            }
        });
    });

    /* -------------------------------------------------------------------------
       1. MOBILE NAVIGATION TOGGLE
       ------------------------------------------------------------------------- */

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

    // Comprehensive context for Groq Llama 3.3 / Qwen
    const INDRAJIT_SYSTEM_PROMPT = `You are the personal AI Assistant for Indrajit Kumar, integrated into his developer portfolio.
Your role is to answer questions from recruiters, hiring managers, and engineers about Indrajit's technical skills, projects, background, and hiring availability.

VERIFIED DOSSIER ON INDRAJIT KUMAR:
- Full Name: Indrajit Kumar
- Professional Identity: Software Engineer | Full-Stack Development & AI Integration | Product Builder
- Education: B.Tech in Computer Science (Jul 2023 – Expected Jul 2027) at Jagannath University, Jaipur, Rajasthan, India. Coursework: Data Structures & Algorithms, Operating Systems, DBMS, Computer Networks, OOP, AI, ML.
- Technical Specialization: Full-Stack Web Development, Backend Architecture, Database Systems & AI/LLM Integration.
- Technical Stack:
  • Languages: C, C++ (DSA), JavaScript (ES6+), Python, Java, SQL
  • Frontend: HTML5, CSS3, React.js, Next.js, Vite, Tailwind CSS
  • Backend: Node.js, Express.js, Django, Flask, FastAPI, GraphQL, Socket.io, WebSocket, REST API, JWT Authentication, Firebase Authentication, Firebase, Supabase, AWS, Google Cloud
  • Databases: MySQL, PostgreSQL, SQLite, MongoDB
  • AI/ML: AI Integration, Generative AI, Prompt Engineering, LLM Integration, OpenAI API, Google Gemini API, Grok API, Ollama, Llama 3, RAG, Qwen, TensorFlow, PyTorch
  • DevOps & Tools: Git, GitHub, VS Code, Android Studio, Docker, Firebase, Vercel, Render, Netlify, MySQL Workbench
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

    // Multi-turn conversation history for Groq
    const conversationHistory = [
        { role: 'system', content: INDRAJIT_SYSTEM_PROMPT }
    ];

    // Fallback knowledge base if no API key is configured yet
    const fallbackKnowledgeBase = {
        intro: `<strong>Indrajit Kumar:</strong> Software Engineer & Full-Stack AI Systems Developer pursuing B.Tech Computer Science (2023–2027) at Jagannath University, Jaipur, Rajasthan, India.
        <ul>
            <li><strong>Core Domain:</strong> Scalable Full-Stack Web Development, Microservices Backend, and Generative AI (LLMs, RAG).</li>
            <li><strong>Flagship Projects:</strong> PraGo (Healthcare AI Super App), Indra-MarketMind (Quantitative Financial AI Terminal), VELOCITY X (3D WebGL Engine), Yaadon Ki Duniya.</li>
            <li><strong>Key Tech:</strong> C++, Python, JavaScript, React, Next.js, Node.js, FastAPI, PostgreSQL, MongoDB, Docker, Groq.</li>
        </ul>
        <div class="fallback-action-group">
            <a href="assets/docs/Indrajit_Kumar_Resume.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary js-view-resume">
                <i class="fa-regular fa-file-pdf"></i> View Resume
            </a>
            <a href="#projects" class="btn btn-sm btn-outline">
                Explore Projects
            </a>
        </div>`,
        education: `<strong>Education & Academics:</strong>
        <ul>
            <li><strong>Degree:</strong> Bachelor of Technology (B.Tech) in Computer Science & Engineering (2023 – Expected 2027)</li>
            <li><strong>University:</strong> Jagannath University, Jaipur, Rajasthan, India</li>
            <li><strong>Core Coursework:</strong> Data Structures & Algorithms (C++), Operating Systems, DBMS, Computer Networks, OOP, AI & Machine Learning.</li>
            <li><strong>Certifications:</strong> PCAP: Programming Essentials in Python (Cisco & Python Institute), Cybersecurity (Cisco), SWOC 2026.</li>
        </ul>`,
        resume: `<strong>Official Verified Resume:</strong> Indrajit's latest ATS-compliant resume (updated 2026) is available:
        <div class="fallback-action-group">
            <a href="assets/docs/Indrajit_Kumar_Resume.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary js-view-resume">
                <i class="fa-regular fa-file-pdf"></i> View Resume
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
        // Strictly allow semantic text tags; block remote images (no IMG) and block inline styles (restrict CSS)
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

                    // Remove all unapproved attributes or any on* event handlers (e.g. onerror, onload)
                    const attrs = Array.from(child.attributes);
                    const allowedForTag = allowedAttrs[tagName] || [];
                    for (const attr of attrs) {
                        const attrName = attr.name.toLowerCase();
                        if (!allowedForTag.includes(attrName) || attrName.startsWith('on') || attrName === 'style') {
                            child.removeAttribute(attr.name);
                        }
                    }

                    // Prevent javascript:, vbscript:, and data: URLs in links
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

    function appendMessage(sender, content, isUser = false) {
        if (!aiMessages) return;
        const bubble = document.createElement('div');
        bubble.className = `ai-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`;
        
        if (!isUser) {
            const safeHtml = sanitizeHtml(content);
            bubble.innerHTML = `<div class="bubble-sender"><img src="assets/images/ai_intel_avatar.webp" alt="IndraIntel" class="bubble-sender-avatar" width="24" height="24" loading="lazy" decoding="async"><span>${escapeHtml(sender)}</span></div><div>${safeHtml}</div>`;
        } else {
            // User queries use textContent directly to completely eliminate XSS risk
            const userContentDiv = document.createElement('div');
            userContentDiv.textContent = content;
            bubble.appendChild(userContentDiv);
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
        if (!aiStatusText) return;
        const activeKey = localStorage.getItem('GROQ_API_KEY') || GROQ_CONFIG.apiKey;
        if (isServerlessBackendAvailable) {
            aiStatusText.textContent = 'IndraIntel AI · Online';
        } else if (activeKey && activeKey.startsWith('gsk_')) {
            aiStatusText.textContent = 'IndraIntel AI · Client Key Active';
        } else {
            aiStatusText.textContent = 'IndraIntel · Offline (Knowledge Base)';
        }
    }

    async function checkBackendAvailability() {
        try {
            // Check if serverless /api/chat is reachable and healthy via GET
            const res = await fetch('/api/chat', { method: 'GET' });
            if (res.ok && res.status === 200) {
                isServerlessBackendAvailable = true;
            } else {
                isServerlessBackendAvailable = false;
            }
        } catch {
            isServerlessBackendAvailable = false;
        }
        updateApiKeyUi();
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
                appendMessage("Indrajit's AI Assistant", `✅ <strong>Groq API Key connected successfully!</strong> Now running live with Groq Cloud <strong>(Qwen 3.8 27B)</strong>. Ask me anything about Indrajit!`);
            } else {
                alert("Invalid key format. Groq API keys start with 'gsk_'. Please check console.groq.com/keys.");
            }
        });
    }

    // Initialize UI status on load
    updateApiKeyUi();
    checkBackendAvailability();

    function markdownToHtml(text) {
        if (!text) return '';

        // 1. Block remote markdown images: convert ![alt](url) to safe descriptive text
        let sanitizedText = text
            .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '[Image: $1]')
            .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<\/?(?:p|div|span|em|strong|b|i)[^>]*>/gi, '');

        function formatInline(str) {
            if (!str) return '';
            const codeMap = [];
            // Extract and preserve inline code blocks
            let s = str.replace(/`([^`]+)`/g, (_, code) => {
                codeMap.push(`<code>${escapeHtml(code)}</code>`);
                return `@@CODE_${codeMap.length - 1}@@`;
            });

            // Escape all raw HTML entities so unescaped model output can never reach innerHTML
            s = escapeHtml(s);

            // Links [text](url) - strictly allow http, https, mailto, and assets/ links
            s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|assets\/|mailto:|\/)[^\s\)]+)\)/g, (match, linkText, url) => {
                const isExternal = url.startsWith('http://') || url.startsWith('https://');
                return `<a href="${url}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : 'target="_blank"'}>${linkText}</a>`;
            });

            // Bold **text** or __text__
            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');

            // Italic *text*
            s = s.replace(/(?:^|\s)\*([^*\s][^*]*[^*\s]|[^*\s])\*(?=\s|$|[.,!?;:])/g, (match, p1) => {
                return match.replace(`*${p1}*`, `<em>${p1}</em>`);
            });

            // Restore escaped code spans
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

    async function queryGroqApi(userQuery) {
        conversationHistory.push({ role: 'user', content: userQuery });

        // Keep system prompt + last 12 messages for bounded request payload
        const systemPrompt = conversationHistory.find(m => m.role === 'system') || conversationHistory[0];
        const nonSystem = conversationHistory.filter(m => m.role !== 'system');
        const boundedHistory = [
            systemPrompt,
            ...nonSystem.slice(-12)
        ];

        // 1. Attempt Vercel Serverless Backend Proxy (/api/chat)
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
                isServerlessBackendAvailable = true;
                updateApiKeyUi();
                const data = await serverlessRes.json().catch(() => ({}));
                const botReply = data.choices?.[0]?.message?.content;
                if (botReply && typeof botReply === 'string' && botReply.trim()) {
                    conversationHistory.push({ role: 'assistant', content: botReply });
                    return markdownToHtml(botReply);
                }
            } else {
                if (serverlessRes.status >= 500 || serverlessRes.status === 404) {
                    isServerlessBackendAvailable = false;
                    updateApiKeyUi();
                }
                const errData = await serverlessRes.json().catch(() => ({}));
                const errMsg = typeof errData.error === 'string'
                    ? errData.error
                    : (errData.error?.message || errData.message || '');

                // Explicit rate limits or bad client payloads should throw informative messages
                if (serverlessRes.status === 429) {
                    throw new Error(errMsg || 'Groq API rate limit reached. Please try again shortly.');
                }
                if (serverlessRes.status === 400) {
                    throw new Error(errMsg || 'Bad request to AI chat service.');
                }

                // If proxy returned 500 (e.g. unconfigured environment key on host), check for client key before falling back
                const clientKey = localStorage.getItem('GROQ_API_KEY') || GROQ_CONFIG.apiKey;
                if (!clientKey) {
                    console.warn(`Server proxy status ${serverlessRes.status}. Using verified offline knowledge base.`);
                    return fallbackQueryHandler(userQuery);
                }
            }
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

        // 3. Local smart offline fallback if no key is entered
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
        // Allow user to set key directly by typing "set key gsk_...", "set_key gsk_...", or "set-key gsk_..."
        const lowerTrimmed = queryText.toLowerCase().trim();
        if (lowerTrimmed.startsWith('set key ') || lowerTrimmed.startsWith('set_key ') || lowerTrimmed.startsWith('set-key ')) {
            const parts = queryText.trim().split(/\s+/);
            const keyPart = (parts[0].toLowerCase() === 'set' ? parts[2] : parts[1])?.trim();
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
            console.error('AI query error:', err);
            appendMessage(
                "IndraIntel · Candidate Copilot",
                `⚠️ <em>IndraIntel is currently in offline mode.</em><br><br>Here is the verified dossier summary: ${fallbackKnowledgeBase.specialty}`
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
                        <div><i class="fa-solid fa-circle-check"></i> <strong>Thank you, ${escapeHtml(name)}! Your message has been sent.</strong></div>
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
                formFeedback.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.4rem; align-items: center; text-align: center;">
                        <div>⚠️ Direct dispatch unreachable. Please send your message directly via one of these options:</div>
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 0.35rem;">
                            <a href="${mailtoUrl}" class="btn btn-sm btn-primary">
                                <i class="fa-solid fa-envelope"></i> Send via Default Mail App
                            </a>
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=indrajitkumar23541@gmail.com&su=${mailtoSubject}&body=${mailtoBody}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">
                                <i class="fa-brands fa-google"></i> Send via Gmail Web
                            </a>
                        </div>
                    </div>
                `;
            }
        });
    }

    /* -------------------------------------------------------------------------
       7. CINEMATIC 3D PARALLAX TILT EFFECT (DESKTOP FINE-POINTER ONLY)
       ------------------------------------------------------------------------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const tiltCards = document.querySelectorAll('.cinematic-tilt, .project-card');

        tiltCards.forEach(card => {
            let tiltRafId = null;

            card.addEventListener('mousemove', (e) => {
                if (tiltRafId) return;
                tiltRafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -7;
                    const rotateY = ((x - centerX) / centerX) * 7;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
                    tiltRafId = null;
                });
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                if (tiltRafId) {
                    cancelAnimationFrame(tiltRafId);
                    tiltRafId = null;
                }
                card.style.transform = '';
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease-out';
            });
        });
    }

    /* -------------------------------------------------------------------------
       8. DIRECT RESUME PDF OPEN IN NEW TAB (NATIVE & INSTANT)
       All resume links open 'assets/docs/Indrajit_Kumar_Resume.pdf' directly
       in a new browser tab with full native PDF viewer capabilities.
       ------------------------------------------------------------------------- */
    const resumeModal = document.getElementById('resume-modal');
    if (resumeModal) {
        resumeModal.setAttribute('hidden', '');
        resumeModal.style.display = 'none';
    }

    /* -------------------------------------------------------------------------
       9. FLOATING INDRAINTEL FAB CONTROLLER (MOBILE & TABLET EXCLUSIVE)
       Pins WhatsApp-style floating AI button strictly to bottom-right of viewport
       ------------------------------------------------------------------------- */
    const fabBtn = document.getElementById('floating-ai-fab');
    if (fabBtn) {
        function syncFloatingFab() {
            if (window.innerWidth <= 991) {
                fabBtn.style.setProperty('display', 'flex', 'important');
                fabBtn.style.setProperty('position', 'fixed', 'important');
                fabBtn.style.setProperty('bottom', '24px', 'important');
                fabBtn.style.setProperty('right', '20px', 'important');
                fabBtn.style.setProperty('left', 'auto', 'important');
                fabBtn.style.setProperty('top', 'auto', 'important');
                fabBtn.style.setProperty('z-index', '999999', 'important');
            } else {
                fabBtn.style.setProperty('display', 'none', 'important');
            }
        }
        fabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'chat.html';
        });
        syncFloatingFab();
        window.addEventListener('resize', syncFloatingFab, { passive: true });
        window.addEventListener('orientationchange', syncFloatingFab, { passive: true });
    }

});
