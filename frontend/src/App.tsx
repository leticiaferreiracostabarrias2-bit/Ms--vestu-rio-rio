import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/pages/Login';
import { Dashboard } from './components/pages/Dashboard';
import { PDV } from './components/pages/PDV';
import { Clientes } from './components/pages/Clientes';
import { Vendas } from './components/pages/Vendas';
import { Relatorios } from './components/pages/Relatorios';
import { PainelGerente } from './components/pages/PainelGerente';

function RotaProtegida({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('@PDV:token');
  return token ? children : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Rotas Privadas / Protegidas */}
            <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
            <Route path="/pdv" element={<RotaProtegida><PDV /></RotaProtegida>} />
            <Route path="/clientes" element={<RotaProtegida><Clientes /></RotaProtegida>} />
            <Route path="/vendas" element={<RotaProtegida><Vendas /></RotaProtegida>} />
            <Route path="/relatorios" element={<RotaProtegida><Relatorios /></RotaProtegida>} />
            <Route path="/gerente" element={<RotaProtegida><PainelGerente /></RotaProtegida>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;