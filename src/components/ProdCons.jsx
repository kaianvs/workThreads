import React, { useState} from 'react';

const ProdCons = () => {
  const [eventos, setEventos] = useState([]);
  const [buffer, setBuffer] = useState(Array(5).fill(null));
  const [loading, setLoading] = useState(false);

  const buscarEventos = async () => {
    try {
      const response = await fetch('http://localhost:3001/exp2/eventos');
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const buscarBuffer = async () => {
    try {
      const response = await fetch('http://localhost:3001/exp2/buffer');
      const data = await response.json();
      setBuffer(data);
    } catch (error) {
      console.error('Erro ao buscar buffer:', error);
    }
  };

  const iniciar = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:3001/exp2/iniciar');
      
      // Atualiza periodicamente
      const intervalEventos = setInterval(buscarEventos, 500);
      const intervalBuffer = setInterval(buscarBuffer, 500);
      
      // Para de atualizar após 31 segundos
      setTimeout(() => {
        clearInterval(intervalEventos);
        clearInterval(intervalBuffer);
        setLoading(false);
      }, 31000);
    } catch (error) {
      console.error('Erro ao iniciar:', error);
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <h2 className=''>Produtores e Consumidores</h2>
      
      <div className="controls">
        <button onClick={iniciar} disabled={loading}>
          {loading ? 'Executando...' : 'Iniciar Experimento'}
        </button>
      </div>
      
      <div className="buffer">
        <h3>Buffer (Tamanho: 5)</h3>
        <div className="buffer-items">
          {buffer.map((item, index) => (
            <div key={index} className="buffer-item">
              {item !== null ? item : 'Vazio'}
            </div>
          ))}
        </div>
      </div>
      
      <div className="status">
        <div className="turn-indicator">
          <h4>Turno Atual:</h4>
          <div className={`turn ${eventos.length > 0 && eventos[eventos.length-1].tipo === 'produtor' ? 'active' : ''}`}>
            Produtor
          </div>
          <div className={`turn ${eventos.length > 0 && eventos[eventos.length-1].tipo === 'consumidor' ? 'active' : ''}`}>
            Consumidor
          </div>
        </div>
        
        <div className="counters">
          <div className="counter">
            <span className="label">Produzidos:</span>
            <span className="value">
              {eventos.filter(e => e.tipo === 'produtor').length}
            </span>
          </div>
          <div className="counter">
            <span className="label">Consumidos:</span>
            <span className="value">
              {eventos.filter(e => e.tipo === 'consumidor').length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="event-log">
        <h3>Log de Eventos:</h3>
        <ul>
          {eventos.map((evento, index) => (
            <li key={index} className={evento.tipo}>
              <span className="timestamp">
                {new Date(evento.timestamp).toLocaleTimeString()}:
              </span>
              {evento.tipo === 'produtor' && (
                <strong>Produtor {evento.id}</strong>
              )}
              {evento.tipo === 'consumidor' && (
                <strong>Consumidor {evento.id}</strong>
              )}
              {evento.tipo === 'sistema' && (
                <strong>Sistema</strong>
              )}
              : {evento.mensagem}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProdCons;