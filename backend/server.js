// require("dotenv").config();

require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});

const fs = require("fs");
const os = require("os");
const path = require("path");

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
app.use(cors());

app.use(express.json());

const frontendPath = path.join(__dirname, "..", "frontend");

app.use(express.static(frontendPath));

// conexión a Google
// const auth = new google.auth.GoogleAuth({
//     keyFile: "./config/google-credentials.json",
//     scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
// });

const auth = new google.auth.GoogleAuth({
    ...(process.env.GOOGLE_CREDENTIALS
        ? { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS) }
        : { keyFile: path.join(__dirname, "config", "google-credentials.json") }),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ],
});

// // ID del Sheet
// const spreadsheets = {
//     A: "1FAojRrSV7PIrftOKlHNp0ua8nLJNZiSd-a2iT9RyyZQ",
//     B: "1QRdl0oI0WyDcBBe7TbDSB42qYHF7TrrbuuBnuXVGFA8",
//     C: "1Z_CYkMGHo4yCgpxS8O_Gd7U3kjxRM3Zx2qG-AiTFm2o",
//     D: "1KHoBn0hjsxuzzB_y4sL2-QoZXQx-v-3nnBqvxGEUAk4",
//     E: "1IF4QamJ1D-h4PWgIv-j4tvsB2Qq0TvVn68yzKXbTrk4",
//     F: "19P-QJh75rVArMahlAs0iy72AREJoHM2Pao7YcpYW7K4",
//     G: "1GxPqTcBfgJ-0iQ9yjk5CL2seBqFjeaRv3V4BTQ41C00",
//     H: "1OlR5IjIl3sv8MJ0sABNt1q-4BSIG12vyECw1ur6xwt4",
//     I: "1PdSfzy9ZdvUQaNejIwZw5ReyqJ1sgX2CmgGu5Y4csBk",
//     J: "1PpEQBFRj0N8-DY-rqLMRf6eaV3xahcoy3LttrW0IHwg",
//     L: "13Gx7kKnARAu_iO9gSshfWFGKOumEzc9Pb75pTjyKz5M",
//     M: "1uunFsLkm6hfmlI42ykFQwVd3rckGojXcJBeD62t-Knk",
//     O: "1qvsRsCo3ad42FA472okatJIraLzQWOEN2Di9XqWbgSw",
//     P: "1x5UmhofGXZe-ESE8Fe9VbC2irTN-7y7HEjCmGBx_Pf8",
//     R: "1eGlYr0n0UgpvT-evOUOxvAz6iOW-Cq6Pu0K6r2ujCls",
//     S: "1vb1tXXiJYW1QWi-sQC-7wf3Jv5FFsuz9DJT9QMFmNnE",
//     T: "1kbuMiDnb7xSFG_EOHKL9zD0ZZV1-W_rglF-3WY4QFwE",
//     V: "1_xiMvIje-2Ww5OSPxmJDANfWZ-7D0ByJm6axWWNznjQ",
//     Y: "1rnaH8a9AQiSYugbcvecaUU_GYHTV0boIh-Ac6Cpf4gE",
// };
const spreadsheets = {
    A: process.env.SPREADSHEET_A,
    B: process.env.SPREADSHEET_B,
    C: process.env.SPREADSHEET_C,
    D: process.env.SPREADSHEET_D,
    E: process.env.SPREADSHEET_E,
    F: process.env.SPREADSHEET_F,
    G: process.env.SPREADSHEET_G,
    H: process.env.SPREADSHEET_H,
    I: process.env.SPREADSHEET_I,
    J: process.env.SPREADSHEET_J,
    L: process.env.SPREADSHEET_L,
    M: process.env.SPREADSHEET_M,
    O: process.env.SPREADSHEET_O,
    P: process.env.SPREADSHEET_P,
    R: process.env.SPREADSHEET_R,
    S: process.env.SPREADSHEET_S,
    T: process.env.SPREADSHEET_T,
    V: process.env.SPREADSHEET_V,
    Y: process.env.SPREADSHEET_Y
};

const SPREADSHEET_BUSQUEDA = process.env.SPREADSHEET_BUSQUEDA;

async function leerHoja(spreadsheetId, sheetName) {
    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: "v4",
        auth: client,
    });

    const response = await ejecutarConReintento(() =>
        googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        })
    );

    return response.data.values;
}

// function convertirLinkDrive(url) {

//     if (!url) return "";

//     const match = url.match(/\/d\/(.*?)\//);

//     if (!match) return url;

//     const fileId = match[1];

//     return `https://drive.usercontent.google.com/download?id=${fileId}&authuser=0`;
// }

function convertirLinkDrive(url) {

    if (!url) return "";

    const match = url.match(/\/d\/(.*?)\//);

    if (!match) return url;

    const fileId = match[1];

    return `https://lh3.googleusercontent.com/d/${fileId}`;
}

let cacheBusqueda = [];
let cacheProductosPorHoja = {};
const TIEMPO_CACHE = 14 * 24 * 60 * 60 * 1000; // 14 días

let cacheBusquedaTimestamp = 0;
let promesaCargaBusqueda = null;

async function asegurarCacheBusqueda() {
    const ahora = Date.now();

    if (
        cacheBusqueda.length > 0 &&
        ahora - cacheBusquedaTimestamp < TIEMPO_CACHE
    ) {
        console.log("Cache de búsqueda usado");
        return;
    }

    if (!promesaCargaBusqueda) {
        console.log("Cargando cache de búsqueda...");

        promesaCargaBusqueda = cargarCacheBusqueda()
            .then(() => {
                cacheBusquedaTimestamp = Date.now();
                console.log("Cache de búsqueda actualizado");
            })
            .finally(() => {
                promesaCargaBusqueda = null;
            });
    }

    await promesaCargaBusqueda;
}

async function obtenerProductosPorHoja(hoja) {
    const ahora = Date.now();

    if (
        cacheProductosPorHoja[hoja] &&
        ahora - cacheProductosPorHoja[hoja].timestamp < TIEMPO_CACHE
    ) {
        console.log("Cache usado para hoja:", hoja);
        return cacheProductosPorHoja[hoja].productos;
    }

    const letra = hoja.charAt(0).toUpperCase();
    const spreadsheetId = spreadsheets[letra];

    if (!spreadsheetId) {
        throw new Error("No existe spreadsheet para esta línea");
    }

    const data = await leerHoja(spreadsheetId, hoja);

    if (!data || data.length === 0) {
        throw new Error("Hoja vacía o no encontrada");
    }

    const headers = data[0];
    const rows = data.slice(1);

    const productos = rows.map(row => {
        let obj = {};

        headers.forEach((header, index) => {
            const key = header.trim();
            let value = row[index];

            if (key === "Imagenes") {
                value = convertirLinkDrive(value);
            }

            obj[key] = value;
        });

        return obj;
    });

    cacheProductosPorHoja[hoja] = {
        timestamp: ahora,
        productos
    };

    console.log("Hoja actualizada en cache:", hoja);

    return productos;
}

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

async function ejecutarConReintento(operacion, intentos = 6) {
    for (let i = 0; i < intentos; i++) {
        try {
            return await operacion();
        } catch (error) {
            const status = error.code || error.response?.status;
            const mensaje = error.message || "";

            const esErrorCuota =
                status === 429 ||
                mensaje.includes("Quota exceeded") ||
                mensaje.includes("Too many requests");

            if (!esErrorCuota) {
                throw error;
            }

            const espera =
                Math.min(64000, Math.pow(2, i) * 1000) +
                Math.floor(Math.random() * 1000);

            console.log(
                `Límite de Google Sheets. Reintentando en ${Math.round(espera / 1000)} segundos...`
            );

            await sleep(espera);
        }
    }

    throw new Error("No se pudo completar la petición a Google Sheets después de varios intentos.");
}

// ==========================================
// GENERAR INDICE MAESTRO PARA EL BUSCADOR
// ==========================================

async function generarIndiceBusqueda() {

    console.log("Generando índice de búsqueda...");

    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: "v4",
        auth: client
    });

    const productosIndice = [];

    // Recorrer archivos A, B, C... Y
    for (const letra in spreadsheets) {

        const spreadsheetId = spreadsheets[letra];

        if (!spreadsheetId) {
            console.log("Spreadsheet no configurado:", letra);
            continue;
        }

        try {

            console.log("Leyendo archivo:", letra);

            // Obtener todas las pestañas del archivo
            const meta = await ejecutarConReintento(() =>
                googleSheets.spreadsheets.get({
                    spreadsheetId
                })
            );

            const hojas = meta.data.sheets.map(
                sheet => sheet.properties.title
            );

            // Recorrer cada pestaña
            for (const hoja of hojas) {

                try {

                    console.log("Leyendo hoja:", hoja);

                    const data = await leerHoja(
                        spreadsheetId,
                        hoja
                    );

                    if (!data || data.length <= 1) {
                        continue;
                    }

                    const headers = data[0];
                    const rows = data.slice(1);

                    const indiceNombre = headers.findIndex(
                        h => h?.trim().toLowerCase() === "nombre"
                    );

                    const indiceClave = headers.findIndex(
                        h => h?.trim().toLowerCase() === "clave"
                    );

                    // Si la hoja no tiene Nombre o Clave, la ignoramos
                    if (indiceNombre === -1 || indiceClave === -1) {
                        console.log(
                            `Hoja ignorada (${hoja}): faltan Nombre o Clave`
                        );
                        continue;
                    }

                    rows.forEach(row => {

                        const nombre = row[indiceNombre] || "";
                        const clave = row[indiceClave] || "";

                        // Ignorar filas vacías
                        if (!nombre && !clave) {
                            return;
                        }

                        productosIndice.push([
                            String(clave),
                            String(nombre),
                            hoja
                        ]);

                    });

                    console.log(
                        `OK ${hoja}: ${rows.length} filas`
                    );

                    // Evitar golpear demasiado rápido la API de Google
                    await sleep(1000);

                } catch (error) {

                    console.error(
                        `Error leyendo hoja ${hoja}:`,
                        error.message
                    );

                }
            }

        } catch (error) {

            console.error(
                `Error leyendo archivo ${letra}:`,
                error.message
            );

        }
    }

    console.log(
        "Productos encontrados:",
        productosIndice.length
    );

    // Primero limpiar la hoja BUSQUEDA anterior
    await ejecutarConReintento(() =>
        googleSheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_BUSQUEDA,
            range: "BUSQUEDA!A:C"
        })
    );

    // Escribir encabezados + productos
    const valores = [
        ["Clave", "Nombre", "Linea"],
        ...productosIndice
    ];

    await ejecutarConReintento(() =>
        googleSheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_BUSQUEDA,
            range: "BUSQUEDA!A1",
            valueInputOption: "RAW",
            requestBody: {
                values: valores
            }
        })
    );

    console.log(
        `Índice actualizado correctamente: ${productosIndice.length} productos`
    );

    return productosIndice.length;
}

// ============================
// CARGAR TODOS LOS PRODUCTOS
// ============================

async function cargarCacheBusqueda() {

    console.log("Cargando índice desde BUSQUEDA...");

    const data = await leerHoja(
        SPREADSHEET_BUSQUEDA,
        "BUSQUEDA"
    );

    if (!data || data.length <= 1) {
        cacheBusqueda = [];
        console.log("BUSQUEDA está vacía");
        return;
    }

    const rows = data.slice(1);

    cacheBusqueda = rows
        .filter(row => row[0] || row[1])
        .map(row => ({
            Clave: String(row[0] || ""),
            Nombre: String(row[1] || ""),
            linea: String(row[2] || "")
        }));

    console.log(
        `Cache de búsqueda cargado: ${cacheBusqueda.length} productos`
    );
}



app.get("/api/productos/:hoja", async (req, res) => {
    try {
        const hoja = req.params.hoja.trim();

        const productos = await obtenerProductosPorHoja(hoja);

        res.json({
            hoja,
            total: productos.length,
            productos
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            error: error.message
        });
    }
});

// ==========================================
// ACTUALIZAR INDICE DE BUSQUEDA
// ==========================================

app.get("/api/actualizar-busqueda", async (req, res) => {

    try {

        const total = await generarIndiceBusqueda();

        // Borrar cache anterior para que después
        // se vuelva a cargar con información nueva
        cacheBusqueda = [];
        cacheBusquedaTimestamp = 0;

        res.json({
            ok: true,
            mensaje: "Índice de búsqueda actualizado",
            productos: total
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }
});

// // prueba básica
// app.get("/", (req, res) => {
//     res.send("Backend del catálogo funcionando 🚀");
// });

app.get("/api/busqueda", async (req, res) => {

    try {

        const q =
            req.query.q?.toLowerCase().trim();

        if (!q) {
            return res.json([]);
        }

        await asegurarCacheBusqueda();

        const resultados =
            cacheBusqueda.filter(producto => {

                const nombre =
                    producto.Nombre
                        ?.toLowerCase() || "";

                const linea =
                    producto.linea
                        ?.toLowerCase() || "";

                const clave =
                    producto.Clave
                        ?.toLowerCase() || "";

                return (
    nombre.includes(q) ||
    clave.includes(q) ||
    linea.includes(q)
);
            });

        res.json(
            resultados.slice(0, 20)
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

async function iniciarServidor() {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

// Mostrar el frontend para cualquier ruta
app.use((req, res) => {
    res.sendFile(
        path.join(frontendPath, "index.html")
    );
});

iniciarServidor();
