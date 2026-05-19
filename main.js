// ── TERMINAL INTRO (fast — like an elevator) ──────────────────────────────────
(function initTerminalIntro() {
    const overlay = document.getElementById('terminal-intro');
    if (!overlay) return;

    // Only show on first visit
    if (localStorage.getItem('intro_seen')) {
        overlay.remove();
        return;
    }
    localStorage.setItem('intro_seen', '1');

    const introBody = document.getElementById('intro-body');
    let skipped = false;

    const sleep = (ms) => new Promise(r => setTimeout(r, skipped ? 0 : ms));

    async function typeText(el, text, speed = 28) {
        for (let i = 0; i < text.length; i++) {
            if (skipped) { el.textContent = text; return; }
            el.textContent = text.slice(0, i + 1);
            await sleep(speed + Math.random() * 12);
        }
    }

    async function addCommand(cmd) {
        const line = document.createElement('div');
        line.className = 'intro-prompt-line';
        const sym = document.createElement('span');
        sym.className = 'intro-prompt-sym';
        sym.textContent = '$';
        const txt = document.createElement('span');
        txt.className = 'intro-cmd-text';
        line.appendChild(sym);
        line.appendChild(txt);
        introBody.appendChild(line);
        await typeText(txt, cmd, 28);
        await sleep(180);
    }

    async function addOutput(text, cls = 'intro-output-line') {
        const el = document.createElement('div');
        el.className = cls;
        el.textContent = text;
        introBody.appendChild(el);
        await sleep(100);
    }

    async function showProgressBar() {
        const el = document.createElement('div');
        el.className = 'intro-progress';
        introBody.appendChild(el);
        const total = 20;
        for (let i = 0; i <= total; i++) {
            if (skipped) { el.textContent = `[${'█'.repeat(total)}] 100%`; return; }
            el.textContent = `[${'█'.repeat(i)}${'░'.repeat(total - i)}] ${Math.round(i / total * 100)}%`;
            await sleep(55); // fills in ~1.1s
        }
    }

    function blank() {
        introBody.appendChild(document.createElement('br'));
    }

    function exitIntro() {
        overlay.classList.add('exit');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    async function run() {
        await sleep(350);

        const sys = document.createElement('div');
        sys.className = 'intro-system-line';
        sys.textContent = 'Last login: Sun Mar 15 2026 on ttys001';
        introBody.appendChild(sys);
        await sleep(300);
        blank();

        await addCommand('whoami');
        await addOutput('akhil_bodahanapati');
        await sleep(200);
        blank();

        await addCommand('./load_portfolio.sh');
        await addOutput('Initializing...');
        await sleep(200);
        await showProgressBar();
        await addOutput('✓ Ready.', 'intro-output-line intro-success');
        await sleep(200);
        blank();

        await addCommand('open portfolio');
        await addOutput('✓ Launching...', 'intro-output-line intro-success');
        await sleep(700);

        exitIntro();
    }

    function skip() { skipped = true; exitIntro(); }
    document.addEventListener('keydown', skip, { once: true });
    overlay.addEventListener('click', skip, { once: true });

    run();
})();

// ── CUSTOM CURSOR (desktop/mouse only) ────────────────────────────────────────
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorMain = document.querySelector('.cursor-main');
    const cursorFollower = document.querySelector('.cursor-follower');
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        cursorMain.style.left = mx + 'px';
        cursorMain.style.top = my + 'px';
    });

    (function animateCursor() {
        fx += (mx - fx) * 0.22;
        fy += (my - fy) * 0.22;
        cursorFollower.style.left = fx + 'px';
        cursorFollower.style.top = fy + 'px';
        requestAnimationFrame(animateCursor);
    })();

    document.addEventListener('mouseleave', () => { cursorMain.style.opacity = '0'; cursorFollower.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursorMain.style.opacity = '1'; cursorFollower.style.opacity = '1'; });

    document.querySelectorAll('a, button, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorMain.style.transform = 'scale(2)';
            cursorFollower.style.borderColor = 'rgba(197,255,65,0.8)';
            cursorFollower.style.transform = 'scale(1.3)';
        });
        el.addEventListener('mouseleave', () => {
            cursorMain.style.transform = 'scale(1)';
            cursorFollower.style.borderColor = 'rgba(197,255,65,0.45)';
            cursorFollower.style.transform = 'scale(1)';
        });
    });
}

// ── MAIN INIT ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    AOS.init({ duration: 700, easing: 'ease-out', once: true });

    // GSAP text animations
    const gsapScript = document.createElement('script');
    gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    gsapScript.onload = initTextAnimations;
    document.head.appendChild(gsapScript);

    function initTextAnimations() {
        function splitText(el) {
            const t = el.textContent;
            el.textContent = '';
            t.split('').forEach(c => {
                const s = document.createElement('span');
                s.className = 'char';
                s.textContent = c === ' ' ? '\u00A0' : c;
                el.appendChild(s);
            });
        }

        document.querySelectorAll('.heading-animate').forEach(el => {
            splitText(el);
            new IntersectionObserver((entries, obs) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        gsap.to(e.target.querySelectorAll('.char'), { opacity: 1, duration: 0.45, stagger: 0.04, ease: 'power2.out' });
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.5 }).observe(el);
        });
    }

    // Navbar scroll
    window.addEventListener('scroll', () => {
        document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 40);
    });

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => { if (pageYOffset >= s.offsetTop - 200) current = s.id; });
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href').slice(1) === current));
    });

    // Mobile nav
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    burger.addEventListener('click', () => { nav.classList.toggle('active'); burger.classList.toggle('toggle'); });
    navLinks.forEach(a => a.addEventListener('click', () => { nav.classList.remove('active'); burger.classList.remove('toggle'); }));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        });
    });

    // Project card glow
    document.querySelectorAll('.proj-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.background = `radial-gradient(circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(197,255,65,0.05), #141414 55%)`;
        });
        card.addEventListener('mouseleave', () => { card.style.background = ''; });
    });

    // Vimeo videos autoplay when in view
    const sendVimeoCommand = (iframe, method, value) => {
        const payload = value === undefined ? { method } : { method, value };
        iframe.contentWindow?.postMessage(JSON.stringify(payload), 'https://player.vimeo.com');
    };

    const autoplayVideos = document.querySelectorAll('[data-autoplay-video]');
    if (autoplayVideos.length) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const iframe = entry.target.querySelector('iframe');
                if (!iframe) return;

                if (entry.isIntersecting) {
                    const playbackRate = Number(entry.target.dataset.playbackRate || '1');
                    sendVimeoCommand(iframe, 'setPlaybackRate', playbackRate);
                    sendVimeoCommand(iframe, 'play');
                } else {
                    sendVimeoCommand(iframe, 'pause');
                }
            });
        }, { threshold: 0.55 });

        autoplayVideos.forEach((container) => videoObserver.observe(container));
    }

});
