import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate(); 
  
  const [documentNumber, setDocumentNumber] = useState('');
  // NOVO: Estado para guardar o tipo de certidão (inicia com o ID 1)
  const [serviceId, setServiceId] = useState('1'); 
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const [emissions, setEmissions] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('@ddmanager:token'); 
    navigate('/'); 
  };

  const fetchEmissions = async () => {
    try {
      const response = await api.get('/api/emissions/historico/1');
      setEmissions(response.data);
    } catch (err) {
      console.error("Erro ao carregar o histórico:", err);
    }
  };

  useEffect(() => {
    fetchEmissions();
  }, []);

  const handleEmitir = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      await api.post('/api/emissions/emitir', {
        user_id: 1,       
        // NOVO: Enviamos o ID da certidão que o utilizador escolheu no menu
        service_id: parseInt(serviceId),    
        parametros: {
          cnpj: documentNumber 
        }
      });

      setFeedback({ 
        type: 'success', 
        message: '🚀 Certidão solicitada com sucesso! O robô já está a trabalhar.' 
      });
      setDocumentNumber(''); 
      
      fetchEmissions();
      
    } catch (err) {
      console.error(err);
      const mensagemErro = err.response?.data?.detail || 'Erro ao solicitar certidão.';
      setFeedback({ 
        type: 'error', 
        message: `❌ ${mensagemErro}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (emissionId, documentNumber) => {
    try {
      const response = await api.get(`/api/emissions/download/${emissionId}`, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certidao_${documentNumber}.pdf`); 
      document.body.appendChild(link);
      link.click(); 
      link.remove(); 
      
    } catch (err) {
      console.error("Erro ao baixar PDF:", err);
      alert("❌ O PDF ainda não está disponível ou ocorreu um erro.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
            <p className="text-gray-600 mt-1">Bem-vindo ao DDManager. O seu ambiente de emissões.</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Sair
          </button>
        </div>
        
        {/* Formulário de Nova Emissão Atualizado */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Nova Solicitação</h2>
          
          <form onSubmit={handleEmitir} className="flex flex-col md:flex-row gap-4 items-end">
            
            {/* NOVO: Menu Dropdown de Seleção */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Certidão
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value="receita-federal/pgfn">Receita Federal (CND)</option>
                <option value="2">FGTS (Regularidade)</option>
                <option value="3">Trabalhista (CNDT)</option>
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ / CPF
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Digite apenas números..."
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
            >
              {isLoading ? 'A processar...' : 'Emitir Certidão'}
            </button>
          </form>

          {feedback && (
            <div className={`mt-4 p-4 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {feedback.message}
            </div>
          )}
        </div>

        {/* Tabela de Histórico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Histórico de Emissões</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma emissão encontrada.
                    </td>
                  </tr>
                ) : (
                  emissions.map((emissao) => (
                    <tr key={emissao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{emissao.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emissao.document_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${emissao.status === 'sucesso' ? 'bg-green-100 text-green-800' : 
                            emissao.status === 'processando' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {emissao.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {emissao.status === 'sucesso' ? (
                          <button
                            onClick={() => handleDownload(emissao.id, emissao.document_number)}
                            className="text-blue-600 hover:text-blue-900 font-medium underline transition-colors"
                          >
                            Baixar PDF
                          </button>
                        ) : emissao.status.startsWith('erro') ? (
                          <span className="text-red-500 font-medium">Falha na Emissão</span>
                        ) : (
                          <span className="text-gray-400">Processando...</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}