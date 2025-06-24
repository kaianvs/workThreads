
import { parentPort, workerData } from 'worker_threads';

const { id } = workerData;

// Enviar mensagem de alô imediatamente
parentPort.postMessage({ 
  id, 
  text: `Alô do filho ${id} (Thread)` 
});


// Simular processamento
setTimeout(() => {
  parentPort.postMessage({ 
    id, 
    text: `Tchau do filho ${id}!` 
  });
}, 3000);