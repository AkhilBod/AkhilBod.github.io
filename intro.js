// ── FINDER INTRO ─────────────────────────────────────────────────────────────
(function initFinderIntro() {
    const overlay = document.getElementById('finder-intro');
    if (!overlay) return;

    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    const isMobileIntro = window.matchMedia('(max-width: 640px), (hover: none), (pointer: coarse)').matches;

    if (isPreview || isMobileIntro || localStorage.getItem('intro_seen')) {
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
