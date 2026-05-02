import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Adicione esta linha
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // <-- Chame o motorista aqui

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // O FastAPI espera os dados no formato de formulário (x-www-form-urlencoded)
      const formData = new URLSearchParams();
      formData.append('username', email); // O OAuth2 padrão chama o utilizador de 'username'
      formData.append('password', password);

      // Faz a chamada à nossa rota de login no Back-end
      const response = await api.post('/api/auth/login', formData);
      
      // Extrai o token da pulseira VIP e guarda no cofre do navegador (localStorage)
      const token = response.data.access_token;
      localStorage.setItem('@ddmanager:token', token);
      
      navigate('/dashboard');
      
    } catch (err) {
      console.error(err);
      setError('Credenciais inválidas ou erro no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">DDManager</h2>
          <p className="text-gray-500 mt-2">Acesse a sua conta para emitir certidões</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Se houver um erro, mostramos esta caixa vermelha */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Palavra-passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
          >
            {isLoading ? 'A conectar...' : 'Entrar no Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}