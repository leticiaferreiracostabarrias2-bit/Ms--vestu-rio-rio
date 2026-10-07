import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Puxa as variáveis do arquivo .env para a memória
dotenv.config();

// Criamos um Pool de Conexões (Múltiplos canais abertos simultaneamente)
export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("🔌 Canal de comunicação com o MySQL preparado (Pool de Conexões).");