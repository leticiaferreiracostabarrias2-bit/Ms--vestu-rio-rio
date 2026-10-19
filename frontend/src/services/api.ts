//Ele é responsável por:
//Conectar com o backend na porta correta (ex: http://localhost:3000).
//Anexar o token JWT (Bearer Token) automaticamente no cabeçalho de todas as requisições.
//Tratar erros globais (como token expirado).
//Vamos criar o serviço central de requisições HTTP usando axios. Ele será responsável por se conectar ao nosso backend Node.js/Express e injetar automaticamente o token de autenticação JWT em todas as chamadas.
import axios from 'axios';

// Instância central do Axios apontando para o backend Express
export const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Substitua pelo endereço do seu backend
});

// Interceptor para injetar automaticamente o Bearer Token do usuário
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@PDV:token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (erro) => Promise.reject(erro)
);

// Interceptor para tratamento global de erro 401 (Sessão Expirada)
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response && erro.response.status === 401) {
      localStorage.removeItem('@PDV:token');
      localStorage.removeItem('@PDV:usuario');
    }
    return Promise.reject(erro);
  }
);