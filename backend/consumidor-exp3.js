import { workerData, parentPort } from 'worker_threads';

const { id, buffer, semaphores, bufferSize } = workerData;
const bufferView = new Int32Array(buffer);
const sharedBuffer = bufferView.subarray(0, bufferSize);
const indices = bufferView.subarray(bufferSize);
const sems = new Int32Array(semaphores);

const SEM_EMPTY = 0;
const SEM_FULL = 1;
const SEM_MUTEX = 2;

// Funções semáforos
function down(semArray, index) {
  let current;
  do {
    current = Atomics.load(semArray, index);
    if (current <= 0) {
      Atomics.wait(semArray, index, current);
    }
  } while (!Atomics.compareExchange(semArray, index, current, current - 1));
}

function up(semArray, index) {
  const newValue = Atomics.add(semArray, index, 1);
  Atomics.notify(semArray, index);
  return newValue + 1;
}

async function consumir() {
  while (true) {
    down(sems, SEM_FULL);
    down(sems, SEM_MUTEX);

    // Obter e atualizar outIndex atomicamente
    const pos = Atomics.load(indices, 1);
    const item = Atomics.load(sharedBuffer, pos);
    
    // Marcar como consumido
    Atomics.store(sharedBuffer, pos, 0);
    
    // Atualizar outIndex (buffer circular)
    const newOutIndex = (pos + 1) % bufferSize;
    Atomics.store(indices, 1, newOutIndex);
    
    // Atualizar semEmpty
    const newEmpty = up(sems, SEM_EMPTY);
    
    up(sems, SEM_MUTEX);

    parentPort.postMessage({ 
      tipo: 'consumo', 
      id, 
      item,
      pos,
      empty: newEmpty
    });

    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  }
}

consumir();