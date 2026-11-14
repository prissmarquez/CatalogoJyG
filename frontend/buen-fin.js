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
    function terms(grupo) {
        const box = element('div', 'bf-offer-terms');
        for (const oferta of grupo.ofertas || []) {
            const item = element('div', 'bf-offer-option');
            item.append(element('h4', '', oferta.nombre),
                element('strong', '', `${oferta.descuento}% de descuento`),
                element('p', '', 'En efectivo, transferencia o un solo pago con tarjeta participante.'));
            if (oferta.msi?.length) item.append(element('p', '', `O ${oferta.msi.join(', ')} meses sin intereses, sin descuento, con tarjeta de crédito participante.`));
            if (oferta.amex != null) item.append(element('p', 'bf-amex-terms', oferta.amex
                ? `AMEX e internacionales: ${oferta.amex}% de descuento en un solo pago; sin MSI.`
                : 'AMEX e internacionales: sin descuento y sin MSI.'));
            for (const combinacion of oferta.combinaciones || []) {
                item.append(element('p', 'bf-offer-combo', `${combinacion.descuento}% de descuento + ${combinacion.msi.join(', ')} MSI con tarjeta participante. No aplica con AMEX ni internacionales.`));
            }
            box.append(item);
        }
        if (grupo.nota) box.append(element('p', 'bf-offer-note', grupo.nota));
        return box;
    }
    function lineCard(grupo) {
        const link = element('a', 'bf-line-card');
        link.href = `catalogo.html?buenFin=${encodeURIComponent(grupo.categoria)}`;
        link.append(element('span', 'bf-eyebrow', 'Líneas participantes'),
            element('h3', '', grupo.titulo), terms(grupo),
            element('span', 'bf-line-action', 'Explorar líneas del catálogo →'));
        return link;
    }
    function card(producto, grupo) {
        // Las mismas clases y estructura visual que las promociones del mes.
        const link = element('a', 'best-seller-card offer-card');
        link.href = `producto.html?clave=${encodeURIComponent(producto.Clave)}&linea=${encodeURIComponent(producto.linea)}`;
        const descuento = grupo.ofertas?.[0]?.descuento;
        const badge = element('span', 'discount-badge', descuento ? `${descuento}% de descuento` : 'Selección Buen Fin');
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
                section.append(element('h2', '', grupo.titulo), terms(grupo), grid);
                for (const producto of grupo.productos) {
                    grid.append(card(producto, grupo));
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
