import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './routes/AppRoutes';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ConfigurationsPage from './pages/Configurations';
import ProdutosPage from './pages/Produtos';
import ClientesPage from './pages/Clientes';
import PedidosPage from './pages/Pedidos';
import VisitasPage from './pages/Visitas';
import LeadsPage from './pages/Leads';
import MetasPage from './pages/Metas';
import ReportsPage from './pages/Reports';
import CustosPage from './pages/Custos';
// Import other pages as we create them
// etc.

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Other protected routes will go here */}
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="visitas" element={<VisitasPage />} />
          <Route path="prospeccao" element={<LeadsPage />} />
          <Route path="metas" element={<MetasPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="custos" element={<CustosPage />} />
          <Route path="configuracoes" element={<ConfigurationsPage />} />
        </Route>
        
        {/* Redirect root to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;