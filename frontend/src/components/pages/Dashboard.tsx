import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function Dashboard() {
  const navegar = useNavigate();

  const token = localStorage.getItem('@PDV:token');
  const usuarioSalvo = localStorage.getItem('@PDV:usuario');

  let usuarioLogadoNome = 'Usuário';
  let usuarioLogadoEmail = 'Não informado';
  let usuarioCargo = 'CAIXA';

  if (usuarioSalvo) {
    try {
      const obj = JSON.parse(usuarioSalvo);
      usuarioLogadoNome = obj.nome || 'Usuário';
      usuarioLogadoEmail = obj.email || 'Não informado';
      usuarioCargo = obj.cargo || 'CAIXA';
    } catch (e) {
      // fallback em caso de erro no parse
    }
  }

  useEffect(() => {
    if (!token) {
      navegar('/login');
    }
  }, [token, navegar]);

  const ehGerenteOuAdmin = usuarioCargo === 'GERENTE' || usuarioCargo === 'ADMIN';

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* BANNER PRINCIPAL DE BOAS-VINDAS */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/60 border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sessão Ativa - Perfil {usuarioCargo}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Olá, <span className="text-cyan-400">{usuarioLogadoNome}</span>!
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Bem-vindo ao Painel de Controle do PDV MS² Vestuário. Selecione uma opção abaixo para operar o caixa, gerenciar clientes, consultar relatórios ou acessar a administração.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-700/60 p-4 rounded-2xl shrink-0 backdrop-blur-sm">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-extrabold text-2xl shadow-inner">
              {usuarioLogadoNome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Operador Logado</p>
              <h3 className="text-white font-bold text-sm truncate max-w-[180px]">{usuarioLogadoNome}</h3>
              <span className="text-xs text-slate-400 truncate block max-w-[180px]">{usuarioLogadoEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO: ATALHOS RÁPIDOS DOS MÓDULOS */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${ehGerenteOuAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {/* CARD 1: FRENTE DE CAIXA */}
        <Link 
          to="/pdv" 
          className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-lg hover:border-cyan-500/50 hover:bg-slate-800 transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
              🛒
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Frente de Caixa (PDV)</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Registre novas vendas, consulte o estoque em tempo real, aplique descontos e finalize o checkout.
            </p>
          </div>
        </Link>

        {/* CARD 2: GESTÃO DE CLIENTES */}
        <Link 
          to="/clientes" 
          className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-lg hover:border-emerald-500/50 hover:bg-slate-800 transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
              👥
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gestão de Clientes</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cadastre clientes da loja e consulte o histórico detalhado de compras e peças adquiridas.
            </p>
          </div>
        </Link>

        {/* CARD 3: HISTÓRICO E ESTORNOS */}
        <Link 
          to="/vendas" 
          className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-lg hover:border-amber-500/50 hover:bg-slate-800 transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
              📄
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Histórico & Estornos</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Consulte todas as vendas registradas e solicite o cancelamento/estorno com devolução ao estoque.
            </p>
          </div>
        </Link>

        {/* CARD 4: PAINEL DO GERENTE (EXIBIDO PARA GERENTE E ADMIN) */}
        {ehGerenteOuAdmin && (
          <Link 
            to="/gerente" 
            className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-lg hover:border-purple-500/50 hover:bg-slate-800 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                👑
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Painel do Gerente</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Métricas de ganhos, faturamento total, controle de estornos e CRUD completo de produtos.
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}