
import { useState} from 'react';

const ProcessViewer = () => {
    const [eventos, setEventos] = useState([]);
    const [quantidade, setQuantidade] = useState(2);
    const [loading, setLoading] = useState(false);

   const buscarEventos = async () => {
  try {
    const response = await fetch('http://localhost:3001/exp1/eventos');
    const data = await response.json();
    
    // Ordena eventos por timestamp
    const eventosOrdenados = data.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    setEventos(eventosOrdenados);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
  }
};

    const iniciarProcessos = async () => {
        setLoading(true);
        setEventos([]);
        try {
            await fetch(`http://localhost:3001/exp1/iniciar/${quantidade}`);
            // Começa a monitorar os eventos
            const interval = setInterval(buscarEventos, 1000);
            setTimeout(() => {
                clearInterval(interval);
                setLoading(false);
            }, 4000);
        } catch (error) {
            console.error('Erro ao iniciar processos:', error);
            setLoading(false);
        }
    };

    return (
        <div className="w-full  flex justify-center items-center flex-col text-white">
            <h2 className='font-sora font-bold text-3xl'>Gerenciador de Processos</h2>
            
            <div className="controls flex justify-center items-center flex-col p-6 gap-2">
                <label className='font-sora'>
                    Escolha o número de processos filhos:
                    <input 
                        type="number" 
                        value={quantidade} 
                        className='bg-blue-700 rounded-2xl pl-2 pr-1 w-15'
                        onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                    />
                </label>
                
                <button 
                    className='bg-lime-500 font-sora rounded-2xl w-50'
                    onClick={iniciarProcessos} 
                    disabled={loading}
                >
                    {loading ? 'Executando...' : 'Iniciar Processos'}
                </button>
            </div>
            
            <div className="h-60 max-w-10xs overflow-y-auto rounded-2xl p-5 mb-20 bg-black">
                <h3 className='text-lime-600 font-sora'>Log de Eventos:</h3>
                <ul className='text-lime-600'>
                    {eventos.map((evento, index) => (
                        <li key={index} className={evento.tipo}>
                            <span className="timestamp">
                                {new Date(evento.timestamp).toLocaleTimeString()}:
                            </span>
                            {evento.tipo === 'pai' ? (
                                <strong>{evento.mensagem}</strong>
                            ) : (
                                `Filho : ${evento.mensagem}`
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ProcessViewer;