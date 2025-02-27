const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno manualmente desde .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log("✅ Cargando variables de entorno desde .env...");
    const envVariables = fs.readFileSync(envPath, 'utf8').split('\n');
    envVariables.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} else {
    console.warn("⚠️ No se encontró el archivo .env");
}

console.log("🔍 Probando conexión a Turso...");
console.log("🔹 URL:", process.env.TURSO_DATABASE_URL);
console.log("🔹 Token:", process.env.TURSO_AUTH_TOKEN);

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function testConexion() {
    try {
        const resultado = await db.execute("SELECT 1");
        console.log("✅ Conexión exitosa: ", resultado);
    } catch (error) {
        console.error("❌ Error al conectar con Turso:", error);
    }
}

testConexion();
