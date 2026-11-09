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
    function card(producto, grupo) {
        const article = element('article', 'bf-product-card');
        const link = element('a', 'bf-product-link');
        link.href = `producto.html?clave=${encodeURIComponent(producto.Clave)}&linea=${encodeURIComponent(producto.linea)}`;
        const media = element('div', 'bf-product-art');
        const placeholder = element('span', 'bf-image-placeholder', 'Imagen no disponible');
        media.append(placeholder);
        if (producto.Imagenes) {
            const img = document.createElement('img');
            img.alt = producto.Nombre;
            img.loading = 'lazy';
            img.referrerPolicy = 'no-referrer';
            img.addEventListener('error', () => { img.hidden = true; placeholder.hidden = false; });
            placeholder.hidden = true;
            img.src = producto.Imagenes;
            media.append(img);
        }
        media.append(element('span', 'bf-card-tag', grupo.representativa ? 'Imagen representativa de la línea' : 'Selección Buen Fin'));
        const copy = element('div', 'bf-product-copy');
        copy.append(element('span', 'bf-category', producto.linea),
            element('h3', '', producto.Nombre),
            element('p', '', `Clave: ${producto.Clave}`),
            element('div', 'bf-price-placeholder', 'Precio por confirmar'),
            element('span', 'bf-card-footnote', 'Ver producto →'));
        link.append(media, copy);
        article.append(link);
        return article;
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
            const lines = element('div', 'bf-product-grid');
            const lineSection = element('section', 'bf-catalog-group');
            lineSection.append(element('h3', 'bf-group-title', 'Líneas participantes'), lines);
            fragment.append(lineSection);
            let total = 0;
            for (const grupo of grupos) {
                let grid = lines;
                if (!grupo.representativa) {
                    const section = element('section', 'bf-catalog-group');
                    grid = element('div', 'bf-product-grid');
                    section.append(element('h3', 'bf-group-title', grupo.titulo), grid);
                    fragment.append(section);
                }
                for (const producto of grupo.productos) {
                    const item = card(producto, grupo);
                    if (grupo.representativa) {
                        item.querySelector('.bf-category').textContent = grupo.titulo;
                        item.querySelector('.bf-card-footnote').textContent = 'Ver producto representativo →';
                    }
                    grid.append(item);
                    total++;
                }
                if (!grupo.productos.length) grid.append(element('p', 'bf-section-description', `${grupo.titulo}: productos no disponibles por el momento.`));
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
