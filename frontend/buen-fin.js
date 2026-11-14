(() => {
    const container = document.getElementById('buenFinProducts');
    const status = document.getElementById('buenFinStatus');
    const retry = document.getElementById('buenFinRetry');
    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }
    function lineCard(grupo) {
        const link = element('a', 'bf-line-card');
        link.href = `catalogo.html?buenFin=${encodeURIComponent(grupo.categoria)}`;
        link.append(element('span', 'bf-eyebrow', 'Líneas participantes'),
            element('h3', '', grupo.titulo),
            element('span', 'bf-line-action', 'Explorar líneas del catálogo →'));
        return link;
    }
    function card(producto) {
        // Las mismas clases y estructura visual que las promociones del mes.
        const link = element('a', 'best-seller-card offer-card');
        link.href = `producto.html?clave=${encodeURIComponent(producto.Clave)}&linea=${encodeURIComponent(producto.linea)}`;
        const badge = element('span', 'discount-badge', 'Selección Buen Fin');
        const media = element('div', 'best-seller-image');
        const placeholder = element('span', '', 'Imagen no disponible');
        placeholder.hidden = Boolean(producto.Imagenes);
        media.append(placeholder);
        if (producto.Imagenes) {
            const img = document.createElement('img');
            img.alt = producto.Nombre;
            img.loading = 'lazy';
            img.referrerPolicy = 'no-referrer';
            img.addEventListener('error', () => { img.hidden = true; placeholder.hidden = false; });
            img.src = producto.Imagenes;
            media.append(img);
        }
        link.append(badge, media, element('h3', '', producto.Nombre),
            element('p', '', `Clave: ${producto.Clave}`));
        return link;
    }
    async function load() {
        retry.hidden = true;
        retry.disabled = true;
        status.textContent = 'Cargando productos…';
        try {
            const response = await fetch('/api/buen-fin');
            if (!response.ok) throw new Error('Error de carga');
            const { grupos } = await response.json();
            const fragment = document.createDocumentFragment();
            const lines = element('div', 'bf-line-grid');
            fragment.append(lines);
            let total = 0;
            for (const grupo of grupos) {
                if (grupo.representativa) {
                    lines.append(lineCard(grupo));
                    continue;
                }
                const section = element('section', 'promotion-group');
                const grid = element('div', 'promotion-products-grid');
                section.append(element('h2', '', grupo.titulo), grid);
                for (const producto of grupo.productos) {
                    grid.append(card(producto));
                    total++;
                }
                if (!grupo.productos.length) grid.append(element('p', 'bf-section-description', `${grupo.titulo}: productos no disponibles por el momento.`));
                fragment.append(section);
            }
            container.replaceChildren(fragment);
            const incomplete = grupos.some(g => g.incompleto);
            status.textContent = !total ? 'No se pudieron encontrar los productos participantes.'
                : incomplete ? 'Algunos productos no están disponibles por el momento. Puedes intentar cargarlos de nuevo.' : '';
            retry.hidden = total > 0 && !incomplete;
        } catch {
            status.textContent = 'No se pudieron cargar los productos. Intenta de nuevo.';
            retry.hidden = false;
        } finally {
            retry.disabled = false;
        }
    }
    retry.addEventListener('click', load);
    load();
})();
