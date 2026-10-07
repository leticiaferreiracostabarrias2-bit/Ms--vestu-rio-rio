import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Cadastro } from "./components/pages/Cadastro";
import { Login } from "./components/pages/Login";
import { Dashboard } from "./components/pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100">
        <Header />

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Página Inicial: Formulário de Cadastro do Usuário */}
            <Route path="/" element={<Cadastro />} />
            <Route path="/cadastro" element={<Cadastro />} />
            
            {/* Página de Autenticação / Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Painel Administrativo / Dashboard Protegido */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;