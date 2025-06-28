
import { parentPort, workerData } from 'worker_threads';

const { id } = workerData;

// Enviar mensagem de alô imediatamente
setTimeout(()=>{
  parentPort.postMessage({ 
  id, 
  text: `Alô do filho ${id} (Thread)` 
});
}, 2000);




// Simular processamento
setTimeout(() => {
  parentPort.postMessage({ 
    id, 
    text: `Tchau do filho ${id}!` 
  });
}, 3000);