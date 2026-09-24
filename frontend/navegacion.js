(() => {
    const link = document.querySelector('[data-back-link]');
    if (!link) return;
    const current = new URL(window.location.href);
    const linea = current.searchParams.get('linea');
    if (current.pathname.endsWith('/producto.html') && linea) {
        link.href = `linea.html?linea=${encodeURIComponent(linea)}`;
    }
    // Solo regresar por el historial cuando venimos del mismo catálogo.
    let previous;
    try { previous = new URL(document.referrer); } catch { return; }
    if (previous.origin !== current.origin || previous.href === current.href || window.history.length <= 1) return;
    link.addEventListener('click', event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        window.history.back();
    });
})();
