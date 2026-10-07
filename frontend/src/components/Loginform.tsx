import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(false);

    const navegar = useNavigate();

    const lidarComSubmit = async (evento: React.FormEvent) => {
        evento.preventDefault(); 
        setErro(null);
        setCarregando(true);

        try {
            const resposta = await fetch('http://localhost:3000/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), senha })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                // Armazena Token JWT e dados do usuário autenticado
                localStorage.setItem('kamikase_token', dados.token);
                localStorage.setItem('kamikase_usuario', dados.usuario?.nome || dados.nome || 'Usuário');
                localStorage.setItem('kamikase_email', dados.usuario?.email || email);
                localStorage.setItem('kamikase_usuario_id', String(dados.usuario?.id || ''));
                
                // Redireciona para o painel
                navegar('/dashboard');
            } else {
                setErro(dados.erro || "Falha na autenticação.");
            }
        } catch (error) {
            setErro("Não foi possível conectar ao servidor. Verifique se o back-end está ativo.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <form onSubmit={lidarComSubmit} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Acesso ao Sistema</h2>
                <p className="text-slate-400 text-xs mt-1">Informe suas credenciais para continuar</p>
            </div>

            {erro && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{erro}</span>
                </div>
            )}

            <div className="mb-4">
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="email">
                    E-mail
                </label>
                <input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    placeholder="seu.email@exemplo.com"
                    required
                    disabled={carregando}
                />
            </div>

            <div className="mb-6">
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="senha">
                    Senha
                </label>
                <input 
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    placeholder="Sua senha secreta"
                    required
                    disabled={carregando}
                />
            </div>

            <button 
                type="submit" 
                disabled={carregando}
                className={`w-full font-bold py-3.5 px-4 rounded-xl transition flex justify-center items-center shadow-lg ${
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
                        Autenticando...
                    </span>
                ) : (
                    'Entrar'
                )}
            </button>

            <div className="mt-6 pt-5 border-t border-slate-700/80 text-center">
                <p className="text-slate-400 text-sm">
                    Ainda não tem conta?{' '}
                    <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 transition">
                        Cadastre-se aqui
                    </Link>
                </p>
            </div>
        </form>
    );
}