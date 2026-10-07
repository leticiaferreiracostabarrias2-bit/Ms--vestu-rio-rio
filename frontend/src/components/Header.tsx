import { useNavigate, Link, useLocation } from 'react-router-dom';

export function Header() {
    const navegar = useNavigate();
    const localizacao = useLocation();
    const token = localStorage.getItem('kamikase_token');
    const usuarioNome = localStorage.getItem('kamikase_usuario') || 'Usuário';

    const lidarComLogout = () => {
        localStorage.removeItem('kamikase_token');
        localStorage.removeItem('kamikase_usuario');
        localStorage.removeItem('kamikase_email');
        localStorage.removeItem('kamikase_usuario_id');
        navegar('/login');
    };

    return (
        <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/80 p-4 sm:p-5 shadow-lg sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div 
                    className="flex items-center space-x-3 cursor-pointer group" 
                    onClick={() => navegar(token ? '/dashboard' : '/')}
                >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-xl group-hover:bg-cyan-500/30 transition">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-cyan-400 tracking-tight flex items-center gap-2">
                            MS² Template
                            <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                Base
                            </span>
                        </h1>
                        <p className="text-slate-400 text-xs">Template de Usuários e Autenticação Full Stack</p>
                    </div>
                </div>
                
                {token ? (
                    <nav className="flex items-center space-x-3">
                        <span className="text-slate-300 text-sm hidden md:inline bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                            Olá, <strong className="text-cyan-400">{usuarioNome}</strong>
                        </span>
                        <Link 
                            to="/dashboard"
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                                localizacao.pathname === '/dashboard'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            Dashboard
                        </Link>
                        <button 
                            onClick={lidarComLogout}
                            className="bg-red-600/80 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair
                        </button>
                    </nav>
                ) : (
                    <nav className="flex items-center space-x-2">
                        <Link 
                            to="/"
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                localizacao.pathname === '/' || localizacao.pathname === '/cadastro'
                                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                            }`}
                        >
                            Cadastrar
                        </Link>
                        <Link 
                            to="/login"
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                localizacao.pathname === '/login'
                                    ? 'bg-slate-700 text-white border border-slate-600'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                            }`}
                        >
                            Entrar
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}