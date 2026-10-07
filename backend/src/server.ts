import express from 'express';
import cors from 'cors';
import routes from './routes'; // Importa o index.ts da pasta routes automaticamente

const app = express();

// Habilita CORS para que o front-end (ex: Vite na porta 5173) consiga fazer requisições à API
app.use(cors());

// Middleware crucial: Permite que o Express faça o parse do JSON enviado no req.body
app.use(express.json());

// Injeta o roteador central. Recomendo o prefixo '/api' para separar back-end do front-end.
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] API rodando na porta ${PORT}`);
  console.log(`[Rotas] Mapeadas em http://localhost:${PORT}/api/`);
});