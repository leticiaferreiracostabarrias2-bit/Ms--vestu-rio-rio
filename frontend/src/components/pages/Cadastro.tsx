import { CadastroForm } from '../CadastroForm';

export function Cadastro() {
    return (
        <div className="py-6 sm:py-10 max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Cabeçalho da Página Inicial */}
            <div className="text-center space-y-3">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Template Base Full Stack
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                    Gestão e Autenticação de Usuários
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                    Projeto template pré-configurado com autenticação JWT, senhas criptografadas em Bcrypt e banco de dados MySQL. Comece criando seu usuário abaixo.
                </p>
            </div>

            {/* Container do Formulário */}
            <div>
                <CadastroForm />
            </div>

            {/* Cards Informativos sobre o Template */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">Segurança com JWT</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Tokens de autenticação stateless com expiração e proteção de rotas privadas via middleware.
                    </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">Banco de Dados MySQL</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Pool de conexões assíncrono com mysql2/promise e tabela de usuários otimizada.
                    </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">Pronto para Expansão</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Estrutura MVC modular pronta para receber novas tabelas, controladores e páginas.
                    </p>
                </div>
            </div>
        </div>
    );
}

