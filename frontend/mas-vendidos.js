(() => {
    const track = document.getElementById("bestSellersTrack");
    const previous = document.getElementById("productsPrev");
    const next = document.getElementById("productsNext");
    const status = document.getElementById("bestSellersStatus");
    const retry = document.getElementById("bestSellersRetry");
    const updateButtons = () => {
        previous.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    const move = direction => track.scrollBy({
        left: direction * track.clientWidth,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateButtons, { passive: true });
    new ResizeObserver(updateButtons).observe(track);

    async function load() {
        retry.hidden = true;
        status.textContent = "Cargando productos…";
        try {
            const response = await fetch("/api/mas-vendidos");
            if (!response.ok) throw new Error("No se pudieron cargar los productos.");
            const { productos } = await response.json();
            track.replaceChildren();
            for (const producto of productos) {
                const card = document.createElement("a");
                card.className = "best-seller-card";
                card.href = `producto.html?clave=${encodeURIComponent(producto.Clave)}`;
                const media = document.createElement("div");
                media.className = "best-seller-image";
                const placeholder = document.createElement("span");
                placeholder.textContent = "Imagen no disponible";
                placeholder.hidden = Boolean(producto.Imagenes);
                media.append(placeholder);
                if (producto.Imagenes) {
                    const image = document.createElement("img");
                    image.alt = producto.Nombre || "Producto";
                    image.loading = "lazy";
                    image.src = producto.Imagenes;
                    image.addEventListener("error", () => { image.hidden = true; placeholder.hidden = false; });
                    media.append(image);
                }
                const name = document.createElement("h3");
                name.textContent = producto.Nombre;
                const sku = document.createElement("p");
                sku.textContent = `Clave: ${producto.Clave}`;
                card.append(media, name, sku);
                track.append(card);
            }
            status.textContent = productos.length ? "" : "No hay productos seleccionados disponibles.";
            updateButtons();
        } catch (error) {
            status.textContent = "No se pudieron cargar los productos. Intenta de nuevo.";
            retry.hidden = false;
        }
    }
    retry.addEventListener("click", load);
    load();
})();
