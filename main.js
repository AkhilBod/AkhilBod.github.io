// ── FINDER INTRO ─────────────────────────────────────────────────────────────
(function initFinderIntro() {
    const overlay = document.getElementById('finder-intro');
    if (!overlay) return;

    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

    if (isPreview || localStorage.getItem('intro_seen')) {
        overlay.remove();
        return;
    }

    const folder = document.getElementById('akhil-folder');
    const finderWindow = document.getElementById('finder-window');
    const portfolioFile = document.getElementById('portfolio-file');
    const textFiles = document.querySelectorAll('.text-file');
    const portfolioLaunchWindow = document.getElementById('portfolio-launch-window');
    const hint = document.getElementById('finder-hint');
    let windowOffset = 0;

    function exitIntro() {
        localStorage.setItem('intro_seen', '1');
        overlay.classList.add('exit');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    function openFolder() {
        folder.classList.add('open');
        finderWindow.hidden = false;
        requestAnimationFrame(() => {
            finderWindow.classList.add('open');
            finderWindow.querySelector('.finder-file')?.focus({ preventScroll: true });
        });
        if (hint) hint.textContent = 'Double-click a file';
    }

    function openTextFile(file) {
        const win = document.createElement('section');
        const title = file.dataset.title || 'about_akhil.txt';
        win.className = 'finder-app-window text-preview-window';
        win.setAttribute('aria-label', title);
        win.hidden = true;
        win.style.top = `${28 + windowOffset}vh`;
        win.style.left = `${50 + windowOffset * 0.5}%`;
        win.innerHTML = `
            <div class="finder-toolbar" data-drag-handle>
                <div class="finder-window-dots">
                    <button class="dot-red" type="button" aria-label="Close window" data-window-action="close"></button>
                    <button class="dot-yellow" type="button" aria-label="Close window" data-window-action="close"></button>
                    <button class="dot-green" type="button" aria-label="Zoom window" data-window-action="zoom"></button>
                </div>
                <div class="finder-window-title"></div>
            </div>
            <p></p>
        `;
        win.querySelector('.finder-window-title').textContent = title;
        win.querySelector('p').textContent = file.dataset.content || '';
        overlay.appendChild(win);
        wireWindow(win);
        windowOffset = (windowOffset + 3) % 12;
        win.hidden = false;
        requestAnimationFrame(() => win.classList.add('open'));
    }

    function openPortfolioFile() {
        portfolioLaunchWindow.hidden = false;
        requestAnimationFrame(() => {
            portfolioLaunchWindow.classList.add('open');
        });
        if (hint) hint.textContent = 'Press green to open full portfolio';
    }

    function closeWindow(win) {
        win.classList.remove('open', 'zoomed');
        if (win === finderWindow) {
            folder.classList.remove('open');
            if (hint) hint.textContent = 'Double-click akhil/';
        }
        setTimeout(() => {
            if (!win.classList.contains('open')) {
                if (win.classList.contains('text-preview-window')) {
                    win.remove();
                } else {
                    win.hidden = true;
                }
            }
        }, 180);
    }

    function zoomWindow(win) {
        win.classList.toggle('zoomed');
    }

    function makeWindowDraggable(win) {
        const handle = win.querySelector('[data-drag-handle]');
        if (!handle) return;

        handle.addEventListener('pointerdown', (event) => {
            if (event.target.closest('[data-window-action]')) return;
            const rect = win.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            win.classList.add('dragging');
            win.classList.remove('zoomed');
            handle.setPointerCapture(event.pointerId);

            function move(moveEvent) {
                win.style.left = `${moveEvent.clientX - offsetX + rect.width / 2}px`;
                win.style.top = `${moveEvent.clientY - offsetY}px`;
            }

            function stop() {
                win.classList.remove('dragging');
                handle.removeEventListener('pointermove', move);
                handle.removeEventListener('pointerup', stop);
                handle.removeEventListener('pointercancel', stop);
            }

            handle.addEventListener('pointermove', move);
            handle.addEventListener('pointerup', stop);
            handle.addEventListener('pointercancel', stop);
        });
    }

    folder.addEventListener('dblclick', openFolder);
    portfolioFile.addEventListener('dblclick', openPortfolioFile);
    textFiles.forEach(file => {
        file.addEventListener('dblclick', () => openTextFile(file));
    });

    function wireWindow(win) {
        makeWindowDraggable(win);
        win.querySelectorAll('[data-window-action]').forEach(control => {
            control.addEventListener('click', (event) => {
                event.stopPropagation();
                const action = control.dataset.windowAction;
                if (action === 'close') closeWindow(win);
                if (action === 'zoom') zoomWindow(win);
                if (action === 'open-full') exitIntro();
            });
        });
    }

    [finderWindow, portfolioLaunchWindow].forEach(wireWindow);

    document.addEventListener('keydown', (event) => {
        if (!document.body.contains(overlay)) return;
        if (event.key === 'Escape') {
            exitIntro();
        }
        if (event.key === 'Enter' && document.activeElement === folder) {
            openFolder();
        }
        if (event.key === 'Enter' && document.activeElement?.classList.contains('text-file')) {
            openTextFile(document.activeElement);
        }
        if (event.key === 'Enter' && document.activeElement === portfolioFile) {
            openPortfolioFile();
        }
    });
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
