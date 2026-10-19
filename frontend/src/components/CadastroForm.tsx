import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { FeedbackModal } from './FeedbackModal';
import type { CargoUsuario } from '../types';

export function CadastroForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cargo, setCargo] = useState<CargoUsuario>('CAIXA');

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [sucessoModal, setSucessoModal] = useState(false);

  const navegar = useNavigate();

  const lidarComSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);

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
      // Envia os dados para POST /usuarios (criando a conta no backend)
      await api.post('/usuarios', {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        cargo
      });

      setSucessoModal(true);
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
      setCargo('CAIXA');
    } catch (error: any) {
      const mensagemErro = error.response?.data?.mensagem || 'Falha ao realizar cadastro.';
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <form onSubmit={lidarComSubmit} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Criar Conta de Usuário</h2>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre operadores de caixa, gerentes ou administradores
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
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="cargo">
              Perfil / Cargo *
            </label>
            <select
              id="cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value as CargoUsuario)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              disabled={carregando}
            >
              <option value="CAIXA">Operador de Caixa</option>
              <option value="GERENTE">Gerente</option>
              <option value="ADMIN">Administrador</option>
            </select>
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
          {carregando ? 'Cadastrando usuário...' : 'Cadastrar Usuário'}
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
        mensagem="Usuário cadastrado com sucesso. Agora você pode acessar o sistema com essas credenciais."
        aoFechar={() => {
          setSucessoModal(false);
          navegar('/login');
        }}
      />
    </>
  );
}