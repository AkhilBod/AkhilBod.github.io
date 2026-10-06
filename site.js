(function () {
    var root = document.documentElement;
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    root.setAttribute('data-theme', stored === 'white' ? 'white' : 'black');

    function sync() {
        var current = root.getAttribute('data-theme');
        document.querySelectorAll('.theme-switch button').forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(btn.dataset.theme === current));
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        sync();
        document.querySelectorAll('.theme-switch button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                root.setAttribute('data-theme', btn.dataset.theme);
                try { localStorage.setItem('theme', btn.dataset.theme); } catch (e) {}
                sync();
            });
        });
    });
})();
