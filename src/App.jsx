import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Quando o caminho for a raiz (/), mostra o Login */}
        <Route path="/" element={<Login />} />
        
        {/* Quando o caminho for /dashboard, mostra o Painel */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;