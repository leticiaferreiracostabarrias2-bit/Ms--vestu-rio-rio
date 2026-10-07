import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const navegar = useNavigate();

    // Obtém dados da sessão gravados no momento do login
    const token = localStorage.getItem('kamikase_token');
    const usuarioLogadoNome = localStorage.getItem('kamikase_usuario') || 'Usuário';
    const usuarioLogadoEmail = localStorage.getItem('kamikase_email') || 'Não informado';

    // Garante que apenas usuários autenticados permaneçam no Dashboard
    useEffect(() => {
        if (!token) {
            navegar('/login');
        }
    }, [token, navegar]);

    return (
        <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            {/* BANNER PRINCIPAL DE BOAS-VINDAS */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/60 border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Sessão Ativa com Isolamento de Dados
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Olá, <span className="text-cyan-400">{usuarioLogadoNome}</span>! Bem-vindo(a) ao sistema.
                        </h1>

                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            Você está conectado ao seu espaço individual e protegido. Conforme novos módulos e funcionalidades forem adicionados ao projeto, seus recursos e relatórios ficarão disponíveis diretamente aqui.
                        </p>
                    </div>

                    {/* AVATAR DO USUÁRIO LOGADO */}
                    <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-700/60 p-4 rounded-2xl shrink-0 backdrop-blur-sm">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-extrabold text-2xl shadow-inner">
                            {usuarioLogadoNome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Conta Conectada</p>
                            <h3 className="text-white font-bold text-sm truncate max-w-[180px]">{usuarioLogadoNome}</h3>
                            <span className="text-xs text-slate-400 truncate block max-w-[180px]">{usuarioLogadoEmail}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARDS RESUMO DOS DADOS DA CONTA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/70 p-5 rounded-2xl shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Seu Nome</span>
                    <p className="text-lg font-bold text-white truncate" title={usuarioLogadoNome}>
                        {usuarioLogadoNome}
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">Usuário autenticado</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-5 rounded-2xl shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Seu E-mail</span>
                    <p className="text-lg font-bold text-white truncate" title={usuarioLogadoEmail}>
                        {usuarioLogadoEmail}
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">Login principal</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-5 rounded-2xl shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Status da Conta</span>
                    <p className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        Ativa & Segura
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">Token JWT verificado</span>
                </div>
            </div>

            {/* SEÇÃO: MÓDULOS DO SISTEMA (ESPAÇO PREPARADO PARA CRESCIMENTO) */}
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-3xl p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/70 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                📦
                            </span>
                            Módulos do Sistema
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Aqui ficarão centralizados os módulos e funcionalidades que você criar para o seu projeto.
                        </p>
                    </div>

                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-700/60 text-slate-300 border border-slate-600">
                        Arquitetura Modular
                    </span>
                </div>

                {/* PLACEHOLDER ELEGANTE INDICANDO ESPAÇO PARA OS NOVOS MÓDULOS */}
                <div className="py-12 px-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/40 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl shadow-inner">
                        🚀
                    </div>
                    
                    <div className="max-w-md mx-auto space-y-2">
                        <h3 className="text-xl font-bold text-white">Nenhum módulo ativo no momento</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            O template de autenticação com dados isolados está pronto. Conforme você desenvolver seus módulos de negócio (ex: Produtos, Estoque, Vendas, Tarefas ou Financeiro), seus componentes e atalhos aparecerão nesta seção.
                        </p>
                    </div>
                </div>
            </div>

            {/* GUIA DE COMO EXTENDER E ISOLAR DADOS NOS PRÓXIMOS MÓDULOS */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-base border border-cyan-500/20">
                        💡
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">Boas Práticas de Isolamento de Dados</h3>
                        <p className="text-xs text-slate-400">Garantindo que cada usuário visualize apenas seus próprios registros</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="font-bold text-cyan-400 block text-sm">1. Chave Estrangeira</span>
                        <p>
                            Ao criar novas tabelas no MySQL, adicione a coluna <code className="text-cyan-300 font-mono">usuario_id INT NOT NULL</code> referenciando a tabela <code className="text-cyan-300 font-mono">usuarios(id)</code>.
                        </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="font-bold text-cyan-400 block text-sm">2. Filtro no Backend</span>
                        <p>
                            Nas rotas protegidas pelo <code className="text-cyan-300 font-mono">authMiddleware</code>, utilize sempre <code className="text-cyan-300 font-mono">req.usuarioId</code> nas consultas SQL (<code className="text-slate-400 font-mono">WHERE usuario_id = ?</code>).
                        </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="font-bold text-cyan-400 block text-sm">3. Frontend React</span>
                        <p>
                            Crie os novos componentes de páginas em <code className="text-cyan-300 font-mono">frontend/src/components/pages/</code> e vincule suas rotas e links no painel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}