const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on("cargarDetallesPelicula", (event, pelicula) => {
        if (!pelicula) {
            console.error("❌ No se recibieron datos de la película.");
            return;
        }

        console.log("✅ Cargando detalles de la película:", pelicula);

        // Verifica que los elementos existen antes de asignar valores
        const titulo = document.getElementById("titulo");
        const fecha = document.getElementById("fecha");
        const resumen = document.getElementById("resumen");
        const puntuacion = document.getElementById("puntuacion");
        const poster = document.getElementById("poster");

        if (!titulo || !fecha || !resumen || !puntuacion || !poster) {
            console.error("❌ No se encontraron los elementos en el HTML.");
            return;
        }

        // Asignar datos al HTML
        titulo.innerText = pelicula.title || "Título no disponible";
        fecha.innerText = pelicula.release_date ? `📅 ${pelicula.release_date}` : "Fecha de estreno no disponible";
        resumen.innerText = pelicula.overview || "No hay resumen disponible.";
        puntuacion.innerText = pelicula.vote_average ? `⭐ ${pelicula.vote_average}/10` : "Puntuación no disponible";

        // Asignar imagen del poster
        if (pelicula.poster_path) {
            poster.src = `https://image.tmdb.org/t/p/w300${pelicula.poster_path}`;
            poster.alt = pelicula.title;
        } else {
            poster.src = "https://via.placeholder.com/300x450";
            poster.alt = "No disponible";
        }

        // Agregar evento al botón de cerrar
        document.getElementById("cerrarVentana").addEventListener("click", () => {
            ipcRenderer.send("cerrar-tercera", pelicula.id);
        });
    });
});
