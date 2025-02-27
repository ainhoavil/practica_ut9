const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { inicializarBaseDatos, db } = require('./turso');
const axios = require('axios');
const { TMDB_API_KEY } = require('./config');
const dataForge = require('data-forge');

let ventanaPrincipal;
let ventanaRanking;
let ventanasDetalles = new Map();

async function crearVentanaPrincipal() {
    ventanaPrincipal = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    ventanaPrincipal.loadFile(path.join(__dirname, 'views/index.html'));
    ventanaPrincipal.on('closed', () => ventanaPrincipal = null);

    await inicializarBaseDatos();
}

app.whenReady().then(crearVentanaPrincipal);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (ventanaPrincipal === null) crearVentanaPrincipal();
});

// Evento para abrir la segunda ventana (Ranking de películas)
ipcMain.on('abrirSegundaVentana', () => {
    if (!ventanaRanking) {
        ventanaRanking = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        ventanaRanking.loadFile(path.join(__dirname, 'views/segunda.html'));
        ventanaRanking.on('closed', () => ventanaRanking = null);
    }
});


// Evento para abrir múltiples ventanas con detalles de películas
ipcMain.on("abrirTerceraVentana", (event, pelicula) => {
    if (ventanasDetalles.has(pelicula.id)) {
        ventanasDetalles.get(pelicula.id).focus();
        return;
    }

    let nuevaVentanaDetalles = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    nuevaVentanaDetalles.loadFile(path.join(__dirname, "views/tercera.html"));
    
    nuevaVentanaDetalles.webContents.once("did-finish-load", () => {
        nuevaVentanaDetalles.webContents.send("cargarDetallesPelicula", pelicula);
    });

    ventanasDetalles.set(pelicula.id, nuevaVentanaDetalles);

    nuevaVentanaDetalles.on('closed', () => {
        ventanasDetalles.delete(pelicula.id);
    });
});

// Función reutilizable para cerrar ventanas y volver al índice si es necesario
function cerrarVentana(ventana, coleccion = null, id = null) {
    if (id && coleccion && coleccion.has(id)) {
        coleccion.get(id).close();
        coleccion.delete(id);
    } else if (ventana) {
        ventana.close();
        ventana = null;
    }

    if (!ventanaPrincipal) {
        crearVentanaPrincipal();
    } else {
        ventanaPrincipal.show();
        ventanaPrincipal.focus();
    }
}

//  Evento para cerrar la ventana de ranking
ipcMain.on("cerrar-ranking", () => cerrarVentana(ventanaRanking));

//  Evento para cerrar la ventana de detalles
ipcMain.on("cerrar-tercera", (event, id) => cerrarVentana(null, ventanasDetalles, id));


// Obtener películas populares desde TMDb 
ipcMain.handle('obtenerPeliculasPopulares', async () => {
    try {
        const respuesta = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=es`);
        const peliculas = respuesta.data.results;

        // Guardar películas en Turso
        for (const pelicula of peliculas) {
            await db.execute({
                sql: 'INSERT OR REPLACE INTO peliculas (id, titulo, popularidad) VALUES (?, ?, ?)',
                args: [pelicula.id, pelicula.title, pelicula.popularity]
            });
        }

        return peliculas;
    } catch (error) {
        console.error("Error al obtener películas populares:", error);
        return [];
    }
});

// Obtener películas almacenadas desde Turso
ipcMain.handle('obtenerPeliculasAlmacenadas', async () => {
    try {
        const resultado = await db.execute("SELECT * FROM peliculas ORDER BY popularidad DESC");
        return resultado.rows;
    } catch (error) {
        console.error("Error al obtener películas almacenadas:", error);
        return [];
    }
});

// Buscar películas por título 
ipcMain.handle('buscarPelicula', async (event, consulta) => {
    try {
        const respuesta = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(consulta)}&language=es`);
        return respuesta.data.results;
    } catch (error) {
        console.error("Error al buscar película:", error);
        return [];
    }
});

//  Análisis de ranking con Data-Forge
ipcMain.handle('analizarPeliculas', async () => {
    try {
        console.log("📊 Iniciando análisis de películas...");
        const resultado = await db.execute("SELECT titulo, popularidad FROM peliculas");

        if (!resultado.rows || resultado.rows.length === 0) {
            console.log("⚠️ No hay datos en la base de datos para analizar.");
            return [];
        }

        const df = new dataForge.DataFrame(resultado.rows);
        const ranking = df.orderByDescending(row => row.popularidad).take(10).toArray();

        console.log(" Ranking generado correctamente.");
        return ranking;
    } catch (error) {
        console.error("Error en análisis de películas:", error);
        return [];
    }
} );
 