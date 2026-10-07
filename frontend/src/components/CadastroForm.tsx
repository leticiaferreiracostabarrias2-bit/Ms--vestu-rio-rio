import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FeedbackModal } from './FeedbackModal';

export function CadastroForm() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [erro, setErro] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [sucessoModal, setSucessoModal] = useState(false);

    const navegar = useNavigate();

    const formatarTelefone = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);
        if (apenasNumeros.length <= 10) {
            return apenasNumeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
        }
        return apenasNumeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
    };

    const lidarComMudancaTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTelefone(formatarTelefone(e.target.value));
    };

    const lidarComSubmit = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setErro(null);

        // Validações no Front-End
        if (!nome.trim()) {
            setErro('Por favor, informe seu nome completo.');
            return;
        }

        if (!email.trim()) {
            setErro('Por favor, informe um endereço de e-mail.');
            return;
        }

        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (senha !== confirmarSenha) {
            setErro('As senhas digitadas não coincidem.');
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: email.trim().toLowerCase(),
                    telefone: telefone ? telefone.replace(/\D/g, '') : null,
                    senha
                })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                setSucessoModal(true);
                setNome('');
                setEmail('');
                setTelefone('');
                setSenha('');
                setConfirmarSenha('');
            } else {
                setErro(dados.erro || 'Falha ao realizar cadastro.');
            }
        } catch (error) {
            setErro('Não foi possível conectar ao servidor. Verifique se o back-end está ativo.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <form onSubmit={lidarComSubmit} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Criar Conta</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Preencha os dados abaixo para se cadastrar no sistema
                    </p>
                </div>

                {erro && (
                    <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl mb-5 text-sm font-medium flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{erro}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="nome">
                            Nome Completo *
                        </label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                            placeholder="Ex: Maria Silva"
                            required
                            disabled={carregando}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="email">
                            E-mail *
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                            placeholder="Ex: maria.silva@email.com"
                            required
                            disabled={carregando}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="telefone">
                            Telefone / WhatsApp
                        </label>
                        <input
                            id="telefone"
                            type="tel"
                            value={telefone}
                            onChange={lidarComMudancaTelefone}
                            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                            placeholder="(99) 99999-9999"
                            disabled={carregando}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="senha">
                                Senha *
                            </label>
                            <input
                                id="senha"
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                                placeholder="Mínimo 6 dígitos"
                                required
                                disabled={carregando}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="confirmarSenha">
                                Confirmar Senha *
                            </label>
                            <input
                                id="confirmarSenha"
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                                placeholder="Repita a senha"
                                required
                                disabled={carregando}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={carregando}
                    className={`mt-6 w-full font-bold py-3.5 px-4 rounded-xl transition flex justify-center items-center shadow-lg ${
                        carregando
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-[0.99]'
                    }`}
                >
                    {carregando ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            Cadastrando usuário...
                        </span>
                    ) : (
                        'Cadastrar Usuário'
                    )}
                </button>

                <div className="mt-6 pt-5 border-t border-slate-700/80 text-center">
                    <p className="text-slate-400 text-sm">
                        Já possui uma conta?{' '}
                        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 transition">
                            Fazer login
                        </Link>
                    </p>
                </div>
            </form>

            <FeedbackModal
                visivel={sucessoModal}
                tipo="sucesso"
                titulo="Cadastro Realizado!"
                mensagem="Seu usuário foi cadastrado com sucesso no banco de dados. Agora você já pode acessar o sistema com suas credenciais."
                aoFechar={() => {
                    setSucessoModal(false);
                    navegar('/login');
                }}
            />
        </>
    );
}

