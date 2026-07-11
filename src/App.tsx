import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout
import { AppWrapper } from './components/AppWrapper';
import { Loader } from './components/ui/Loader';

// Pages
import { Tasks } from './pages/Tasks';
import { Ranking } from './pages/Ranking';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Historico } from './pages/Historico';
import { DirtyRanking } from './pages/DirtyRanking';

import Compras from "./pages/Compras";
import Home from "./pages/Home";

// Componente Wrapper para injetar o Layout com Sidebar e Header
function MainLayout() {
  return (
    <AppWrapper>
      <Outlet />
    </AppWrapper>
  );
}

// Componente para proteger rotas exclusivas do Administrador
function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Rota pública (Fora do Layout principal) */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />

      {/* Rotas com o Layout (Sidebar e Header) */}
      <Route element={<MainLayout />}>
        {/*<Route path="/" element={<Home />} />*/}
        <Route path="/compras" element={<Compras />} />
        <Route path="/tarefas" element={<Tasks />} />
        <Route path="/ranking" element={<Ranking />} />

        {/* Rota Protegida: Apenas admin logado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="/historico" element={<Historico />} />
        <Route path="/ranking-da-vergonha" element={<DirtyRanking />}
/>
      </Route>

      {/* Rota de fallback (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}