import { parentPort, workerData } from 'worker_threads';

const { id } = workerData;

function produzir() {
  parentPort.postMessage({ tipo: 'pedido_producao', id });
}

// Handler de mensagens
parentPort.on('message', (msg) => {
  if (msg.tipo === 'confirmacao') {
    // Espera aleatória antes de nova produção
    setTimeout(produzir, Math.random() * 1000);
  } else if (msg.tipo === 'tente_novamente') {
    // Tenta novamente imediatamente
    produzir();
  }
});

// Iniciar produção
produzir();