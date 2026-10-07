export interface Usuario {
    id: number;
    email: string;
    nome: string | null;
    telefone: string | null;
    criado_em?: string;
    atualizado_em?: string;
}

export interface NovoUsuarioForm {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    confirmarSenha?: string;
}

