const { ipcRenderer } = require('electron');

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Solicitando análisis de películas...");

    try {
        const ranking = await ipcRenderer.invoke("analizarPeliculas");
        console.log("Datos recibidos:", ranking);

        const listaRanking = document.getElementById("listaRanking");

        if (!listaRanking) {
            console.error("Error: No se encontró el elemento listaRanking en el HTML.");
            return;
        }

        listaRanking.innerHTML = ""; // Limpiar el contenido anterior

        if (ranking.length > 0) {
            // Mostrar solo las 10 primeras películas
            ranking.slice(0, 10).forEach((pelicula, index) => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${index + 1}. ${pelicula.titulo}</strong><br> Popularidad: ${pelicula.popularidad.toFixed(2)}`;
                listaRanking.appendChild(li);
            });
        } else {
            listaRanking.innerHTML = "<p>No se encontraron películas en el ranking.</p>";
        }
    } catch (error) {
        console.error("Error al cargar el ranking:", error);
        const contenedor = document.getElementById("listaRanking");
        contenedor.innerHTML = "<p style='color:red;'>Error al cargar los datos.</p>";
    }

    // Manejador para el botón de volver al index
    const botonVolver = document.getElementById("volverIndex");

    if (!botonVolver) {
        console.error("Error: No se encontró el botón volverIndex en el HTML.");
        return;
    }

    botonVolver.addEventListener("click", () => {
        console.log("⬅ Volviendo al índice...");
        ipcRenderer.send("cerrar-ranking");
    });
});
