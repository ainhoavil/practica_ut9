const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Cargar manualmente las variables de entorno desde .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    console.log("Cargando variables de entorno desde .env...");
    const envVariables = fs.readFileSync(envPath, 'utf8').split('\n');
    envVariables.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} else {
    console.warn("No se encontró el archivo .env");
}

// Mostrar las credenciales que se están usando en la app
console.log("🔍 Conectando a Turso desde turso.js...");
console.log("🔹 URL:", process.env.TURSO_DATABASE_URL);
console.log("🔹 Token:", process.env.TURSO_AUTH_TOKEN);

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function inicializarBaseDatos() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS peliculas (
                id INTEGER PRIMARY KEY,
                titulo TEXT,
                popularidad REAL
            )
        `);
        console.log("Base de datos de Turso inicializada.");
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
    }
}

module.exports = { db, inicializarBaseDatos };
