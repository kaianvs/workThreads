import { parentPort, workerData } from 'worker_threads';

const { id } = workerData;

function consumir() {
  parentPort.postMessage({ tipo: 'pedido_consumo', id });
}

// Handler de mensagens
parentPort.on('message', (msg) => {
  if (msg.tipo === 'confirmacao') {
    // Espera aleatória antes de novo consumo
    setTimeout(consumir, Math.random() * 1000);
  } else if (msg.tipo === 'tente_novamente') {
    // Tenta novamente imediatamente
    consumir();
  }
});

// Iniciar consumo
consumir();