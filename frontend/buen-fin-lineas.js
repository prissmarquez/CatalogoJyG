(() => {
    const categoria = new URLSearchParams(location.search).get('buenFin');
    if (!categoria) return;
    const hero = document.querySelector('.catalog-hero');
    const container = document.querySelector('.catalog-container');
    async function load() {
        try {
            const response = await fetch('/api/buen-fin/lineas');
            if (!response.ok) throw new Error('Error de carga');
            const grupos = await response.json();
            const grupo = grupos.find(item => item.categoria === categoria);
            if (!grupo) return;
            const normalizar = texto => texto.trim().toUpperCase();
            const permitidas = new Set(grupo.lineas.map(normalizar));
            for (const section of container.querySelectorAll('.catalog-section')) {
                let visibles = 0;
                for (const link of section.querySelectorAll('.catalog-list a')) {
                    const linea = new URL(link.href).searchParams.get('linea') || '';
                    link.hidden = !permitidas.has(normalizar(linea));
                    if (!link.hidden) visibles++;
                }
                section.hidden = visibles === 0;
            }
            hero.querySelector('h1').textContent = grupo.titulo;
            hero.querySelector('p').textContent = 'Selecciona una línea para ver sus productos en el catálogo.';
            hero.querySelector('.catalog-badge').textContent = 'Líneas participantes · Buen Fin';
            document.title = `${grupo.titulo} | Materiales JyG`;
            const back = document.querySelector('[data-back-link]');
            back.href = 'buen-fin.html#bf-productos';
        } catch {
            const message = document.createElement('p');
            message.className = 'product-status';
            message.textContent = 'No se pudieron cargar las líneas participantes. Recarga la página para intentar de nuevo.';
            hero.append(message);
        }
    }
    load();
})();
