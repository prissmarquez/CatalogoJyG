(() => {
    const container = document.getElementById('promotionsProducts');
    const status = document.getElementById('promotionsStatus');
    const retry = document.getElementById('promotionsRetry');
    const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    async function load() {
        status.textContent = 'Cargando promociones…';
        retry.hidden = true;
        try {
            const response = await fetch('/api/promociones');
            if (!response.ok) throw new Error('Error de carga');
            const { grupos } = await response.json();
            container.replaceChildren();
            let total = 0;
            for (const grupo of grupos) {
                if (!grupo.productos.length) continue;
                const section = document.createElement('section');
                section.className = 'promotion-group';
                const heading = document.createElement('h2');
                heading.textContent = grupo.titulo;
                const grid = document.createElement('div');
                grid.className = 'promotion-products-grid';
                for (const producto of grupo.productos) {
                    const card = document.createElement('a');
                    card.className = 'best-seller-card offer-card';
                    card.href = `producto.html?clave=${encodeURIComponent(producto.Clave)}&linea=${encodeURIComponent(producto.linea)}`;
                    const badge = document.createElement('span');
                    badge.className = 'discount-badge';
                    badge.textContent = producto.precioEspecial != null ? 'Precio especial' : `${producto.descuento}% de descuento`;
                    const media = document.createElement('div');
                    media.className = 'best-seller-image';
                    const placeholder = document.createElement('span');
                    placeholder.textContent = 'Imagen no disponible';
                    placeholder.hidden = Boolean(producto.Imagenes);
                    media.append(placeholder);
                    if (producto.Imagenes) {
                        const img = document.createElement('img');
                        img.alt = producto.Nombre;
                        img.loading = 'lazy';
                        img.addEventListener('error', () => { img.hidden = true; placeholder.hidden = false; });
                        img.src = producto.Imagenes;
                        media.append(img);
                    }
                    const name = document.createElement('h3');
                    name.textContent = producto.Nombre;
                    const sku = document.createElement('p');
                    sku.textContent = `Clave: ${producto.Clave}`;
                    card.append(badge, media, name, sku);
                    if (producto.precioEspecial != null) {
                        const price = document.createElement('strong');
                        price.className = 'offer-price';
                        price.textContent = currency.format(producto.precioEspecial);
                        card.append(price);
                    }
                    grid.append(card);
                    total++;
                }
                section.append(heading, grid);
                container.append(section);
            }
            status.textContent = total ? '' : 'No hay promociones disponibles por el momento.';
        } catch {
            status.textContent = 'No se pudieron cargar las promociones. Intenta de nuevo.';
            retry.hidden = false;
        }
    }
    retry.addEventListener('click', load);
    load();
})();
