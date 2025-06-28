import  { useState } from 'react';

const Experimento3 = () => {
  const [eventos, setEventos] = useState([]);
  const [buffer, setBuffer] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(false);
  const [counters, setCounters] = useState({
    produzidos: 0,
    consumidos: 0
  });

  const buscarEventos = async () => {
    try {
      const response = await fetch('http://localhost:3001/exp3/eventos');
      const data = await response.json();
      setEventos(data);
      
      // Atualizar contadores
      const produzidos = data.filter(e => e.tipo === 'produtor').length;
      const consumidos = data.filter(e => e.tipo === 'consumidor').length;
      setCounters({ produzidos, consumidos });
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const buscarBuffer = async () => {
    try {
      const response = await fetch('http://localhost:3001/exp3/buffer');
      const data = await response.json();
      setBuffer(data);
    } catch (error) {
      console.error('Erro ao buscar buffer:', error);
    }
  };

  const iniciar = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:3001/exp3/iniciar');
      
      // Atualiza periodicamente
      const intervalEventos = setInterval(buscarEventos, 300);
      const intervalBuffer = setInterval(buscarBuffer, 300);
      
      // Para de atualizar após 61 segundos
      setTimeout(() => {
        clearInterval(intervalEventos);
        clearInterval(intervalBuffer);
        setLoading(false);
      }, 61000);
    } catch (error) {
      console.error('Erro ao iniciar:', error);
      setLoading(false);
    }
  };

  return (
    <div className="h-full text-white font-sora pb-20 ">
      <h2 className='text-center font-bold text-2xl pb-8'>Experimento 3: 200 Threads (100 Produtores / 100 Consumidores) com Semáforos</h2>
      
      
      
      <div className="flex flex-col justify-center items-center gap-10">
        <h3>Buffer Compartilhado (Tamanho: 10)</h3>
        <div className="grid grid-cols-5 gap-10">
          {buffer.map((item, index) => (
            <div key={index} className="flex justify-center items-center h-10 text-2xl border-2 border-blue-600 p-8 font-bold bg-gray-800 rounded-2xl ">
              {item !== null && item !== 0 ? item : '∅'}
            </div>
          ))}
        </div>
      </div>

      <div className='flex justify-center items-center'>
        <button className="bg-lime-500 font-sora rounded-2xl w-50 pt-2 pb-2 cursor-pointer mt-10" onClick={iniciar} disabled={loading}>
          {loading ? 'Executando...' : 'Iniciar Experimento'}
        </button>
      </div>
      
      <div className="flex justify-center gap-6 m-20">
        <div className="text-center bg-blue-700 p-3 rounded-2xl">
          <span className="block text-2xl text-green-500">Produzidos:</span>
          <span className="block text-lg font-bold">{counters.produzidos}</span>
        </div>
        <div className="text-center bg-blue-700 p-3 rounded-2xl">
          <span className="block text-2xl text-red-500">Consumidos:</span>
          <span className="block text-lg font-bold">{counters.consumidos}</span>
        </div>
      </div>
      
      <div className="  flex flex-col max-h-240 overflow-y-scroll justify-center items-center m-6 p-6 border-2 rounded-2xl border-blue-700">
        <h3 className='text-2xl mb-4'>Log de Eventos (últimos 20)</h3>
        <div className="w-full flex flex-col gap-2 ">
          {eventos.slice(-15).map((evento, index) => (
            <div key={index} /*className={`event ${evento.tipo}`}*/ className='w-full bg-white border-blue-700 border-l-4 h-10 rounded-2xl p-2' >
              <span className="text-1xl text-blue-700 mr-6">
                {new Date(evento.timestamp).toLocaleTimeString()}:
              </span>
              <span className="text-black">
                {evento.tipo === 'produtor' && `Produtor ${evento.id} ${evento.mensagem}`}
                {evento.tipo === 'consumidor' && `Consumidor ${evento.id} ${evento.mensagem}`}
                {evento.tipo === 'sistema' && evento.mensagem}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experimento3;