const { ipcRenderer } = require('electron');

// Cargar automáticamente las películas al abrir la aplicación
window.onload = async () => {
    await cargarPeliculas();
};

// Función para obtener películas populares
async function cargarPeliculas() {
    const peliculas = await ipcRenderer.invoke('obtenerPeliculasPopulares');
    const lista = document.getElementById('listaPeliculas');
    lista.innerHTML = "";

    if (peliculas && peliculas.length > 0) {
        peliculas.forEach(pelicula => {
            const li = document.createElement('li');
            const imagen = pelicula.poster_path ? `https://image.tmdb.org/t/p/w200${pelicula.poster_path}` : "https://via.placeholder.com/200";

            li.innerHTML = `<img src="${imagen}" alt="${pelicula.title}">
                            <strong>${pelicula.title}</strong><br>
                            ⭐ Popularidad: ${pelicula.popularity.toFixed(2)}`;
            li.addEventListener("click", () => abrirVentanaDetalles(pelicula));
            lista.appendChild(li);
        });
    } else {
        lista.innerHTML = "<p>No se encontraron películas.</p>";
    }

    cargarPeliculasAlmacenadas();
}

// Función para cargar películas almacenadas en Turso
async function cargarPeliculasAlmacenadas() {
    const almacenadas = await ipcRenderer.invoke('obtenerPeliculasAlmacenadas');
    const lista = document.getElementById('peliculasAlmacenadas');
    lista.innerHTML = "";

    almacenadas.forEach(pelicula => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${pelicula.titulo}</strong><br>
                        ⭐ Popularidad: ${pelicula.popularidad.toFixed(2)}`;
        lista.appendChild(li);
    });
}

// Función para buscar películas en TMDb
async function buscarPelicula() {
    const consulta = document.getElementById('buscarInput').value;
    if (!consulta) return;

    const resultado = await ipcRenderer.invoke('buscarPelicula', consulta);
    const lista = document.getElementById('resultadoBusqueda');
    lista.innerHTML = "";

    if (resultado && resultado.length > 0) {
        resultado.forEach(pelicula => {
            const li = document.createElement('li');
            const imagen = pelicula.poster_path ? `https://image.tmdb.org/t/p/w200${pelicula.poster_path}` : "https://via.placeholder.com/200";

            li.innerHTML = `<img src="${imagen}" alt="${pelicula.title}">
                            <strong>${pelicula.title}</strong><br>
                            ⭐ Popularidad: ${pelicula.popularity.toFixed(2)}`;
            li.addEventListener("click", () => abrirVentanaDetalles(pelicula));
            lista.appendChild(li);
        });
    } else {
        lista.innerHTML = "<p>No se encontraron resultados.</p>";
    }
}

// Función para abrir la segunda ventana con el ranking
function abrirVentanaRanking() {
    ipcRenderer.send('abrirSegundaVentana');
}

// Función para abrir la tercera ventana con detalles de la película
function abrirVentanaDetalles(pelicula) {
    ipcRenderer.send("abrirTerceraVentana", pelicula);
}

// Asignar evento al botón para abrir `segunda.html`
document.getElementById("abrirRanking").addEventListener("click", abrirVentanaRanking);
