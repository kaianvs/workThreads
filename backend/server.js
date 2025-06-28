import express from 'express';
import cors from 'cors';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
const port = 3001;

// Armazenamento para Experimento 1
const exp1Eventos = [];

// Armazenamento para Experimento 2
const exp2Eventos = [];
let exp2Buffer = null;

// Armazenamento para Experimento 3
const exp3Eventos = [];
let exp3Buffer = null;

// ============== ROTAS PARA EXPERIMENTO 1 ==============
app.get('/exp1/eventos', (req, res) => {
  res.json(exp1Eventos);
});

app.get('/exp1/iniciar/:quantidade', (req, res) => {
  const quantidade = parseInt(req.params.quantidade) || 2;
  iniciarExp1(quantidade);
  res.send(`Iniciando ${quantidade} processos filhos`);
});

function iniciarExp1(numThreads) {
  exp1Eventos.length = 0;
  exp1Eventos.push({ 
    tipo: 'pai', 
    mensagem: 'Alô do pai', 
    timestamp: new Date() 
  });

  const workers = [];
  let threadsFinalizados = 0;
  
  for (let i = 0; i < numThreads; i++) {
    const worker = new Worker(join(__dirname, 'filho.js'), {
      workerData: { id: i }
    });
    
    worker.on('message', (msg) => {
      exp1Eventos.push({ 
        tipo: 'filho', 
        id: msg.id, 
        mensagem: msg.text, 
        timestamp: new Date()
      });
      
      // Verificar se é a mensagem de despedida
      if (msg.text.includes('Tchau')) {
        threadsFinalizados++;
      }
    });
    
    worker.on('exit', () => {
      // Verificar se todos os threads terminaram
      if (threadsFinalizados === numThreads) {
        exp1Eventos.push({ 
          tipo: 'pai', 
          mensagem: 'Tchau do pai!', 
          timestamp: new Date() 
        });
      }
    });
    
    workers.push(worker);
  }

  // Timeout de segurança
  setTimeout(() => {
    if (threadsFinalizados < numThreads) {
      workers.forEach(worker => worker.terminate());
      exp1Eventos.push({ 
        tipo: 'pai', 
        mensagem: 'Tchau do pai! (timeout)', 
        timestamp: new Date() 
      });
    }
  }, 7000); // 6 segundos para garantir
}
// ============== ROTAS PARA EXPERIMENTO 2 ==============
app.get('/exp2/eventos', (req, res) => {
  res.json(exp2Eventos);
});

app.get('/exp2/buffer', (req, res) => {
  res.json(exp2Buffer ? Array.from(exp2Buffer) : Array(5).fill(null));
});

app.get('/exp2/iniciar', (req, res) => {
  iniciarExp2Threads();
  res.send('Produtores e consumidores iniciados com threads');
});

function iniciarExp2Threads() {
  exp2Eventos.length = 0;
  
  const BUFFER_SIZE = 5;
  exp2Buffer = Array(BUFFER_SIZE).fill(null);
  
  let exp2Count = 0;
  let exp2InIndex = 0;
  let exp2OutIndex = 0;
  let exp2Turn = 'produtor';
  
  exp2Eventos.push({ 
    tipo: 'sistema', 
    mensagem: 'Sistema iniciado com 1 produtor e 1 consumidor', 
    timestamp: new Date() 
  });

  const produtor = new Worker(join(__dirname, 'produtor.js'), {
    workerData: { id: 0 }
  });

  const consumidor = new Worker(join(__dirname, 'consumidor.js'), {
    workerData: { id: 0 }
  });

  const podeProduzir = () => exp2Turn === 'produtor' && exp2Count < BUFFER_SIZE;
  const podeConsumir = () => exp2Turn === 'consumidor' && exp2Count > 0;

  produtor.on('message', (msg) => {
    if (msg.tipo === 'pedido_producao') {
      if (podeProduzir()) {
        const item = Math.floor(Math.random() * 100);
        
        exp2Eventos.push({
          tipo: 'produtor',
          id: msg.id,
          mensagem: `Produziu ${item} na pos ${exp2InIndex}`,
          timestamp: new Date()
        });
        
        exp2Buffer[exp2InIndex] = item;
        exp2InIndex = (exp2InIndex + 1) % BUFFER_SIZE;
        exp2Count++;
        exp2Turn = 'consumidor';
        
        // CORREÇÃO AQUI
        produtor.postMessage({ tipo: 'confirmacao', item });
      } else {
        setTimeout(() => {
          // CORREÇÃO AQUI
          produtor.postMessage({ tipo: 'tente_novamente' });
        }, 100);
      }
    }
  });

  consumidor.on('message', (msg) => {
    if (msg.tipo === 'pedido_consumo') {
      if (podeConsumir()) {
        const item = exp2Buffer[exp2OutIndex];
        
        exp2Eventos.push({
          tipo: 'consumidor',
          id: msg.id,
          mensagem: `Consumiu ${item} da pos ${exp2OutIndex}`,
          timestamp: new Date()
        });
        
        exp2Buffer[exp2OutIndex] = null;
        exp2OutIndex = (exp2OutIndex + 1) % BUFFER_SIZE;
        exp2Count--;
        exp2Turn = 'produtor';
        
        // CORREÇÃO AQUI
        consumidor.postMessage({ tipo: 'confirmacao', item });
      } else {
        setTimeout(() => {
          // CORREÇÃO AQUI
          consumidor.postMessage({ tipo: 'tente_novamente' });
        }, 100);
      }
    }
  });

  setTimeout(() => {
    produtor.terminate();
    consumidor.terminate();
    exp2Eventos.push({ 
      tipo: 'sistema', 
      mensagem: 'Sistema encerrado', 
      timestamp: new Date() 
    });
  }, 30000);
}

// ============== ROTAS PARA EXPERIMENTO 3 ==============
app.get('/exp3/eventos', (req, res) => {
  res.json(exp3Eventos);
});

app.get('/exp3/buffer', (req, res) => {
  res.json(exp3Buffer ? Array.from(exp3Buffer) : Array(10).fill(0));
});

// ROTA CORRIGIDA: Chamando iniciarExp3Threads()
app.get('/exp3/iniciar', (req, res) => {
  iniciarExp3Threads();  // AGORA ESTÁ SENDO CHAMADA!
  res.send('200 threads produtoras/consumidoras iniciadas com semáforos');
});

// FUNÇÃO PRINCIPAL DO EXPERIMENTO 3
function iniciarExp3Threads() {
  console.log('Iniciando Experimento 3 com semáforos...');
  exp3Eventos.length = 0;
  
  const BUFFER_SIZE = 10;
  
  // Buffer compartilhado + índices globais
  const sharedBuffer = new SharedArrayBuffer(
    BUFFER_SIZE * Int32Array.BYTES_PER_ELEMENT +  // Buffer
    2 * Int32Array.BYTES_PER_ELEMENT              // Índices inIndex/outIndex
  );
  
  const bufferView = new Int32Array(sharedBuffer);
  
  // Divisão do buffer compartilhado:
  exp3Buffer = bufferView.subarray(0, BUFFER_SIZE);  // Parte do buffer
  const indices = bufferView.subarray(BUFFER_SIZE);   // Parte dos índices
  
  // Inicializar
  exp3Buffer.fill(0);
  Atomics.store(indices, 0, 0);  // inIndex
  Atomics.store(indices, 1, 0);  // outIndex
  
  // Semáforos
  const semBuffer = new SharedArrayBuffer(3 * Int32Array.BYTES_PER_ELEMENT);
  const semaphores = new Int32Array(semBuffer);
  
  Atomics.store(semaphores, 0, BUFFER_SIZE); // semEmpty
  Atomics.store(semaphores, 1, 0);           // semFull
  Atomics.store(semaphores, 2, 1);           // semMutex

  exp3Eventos.push({ 
    tipo: 'sistema', 
    mensagem: 'Sistema iniciado com 100 produtores e 100 consumidores', 
    timestamp: new Date() 
  });

  const workers = [];
  
  // Criar threads produtoras
  for (let i = 0; i < 100; i++) {
    const worker = new Worker(join(__dirname, 'produtor-exp3.js'), {
      workerData: { 
        buffer: sharedBuffer,
        semaphores: semBuffer,
        id: i,
        bufferSize: BUFFER_SIZE
      }
    });
    
    worker.on('message', (msg) => {
      if (msg.tipo === 'producao') {
        exp3Eventos.push({
          tipo: 'produtor',
          id: msg.id,
          mensagem: `Produziu ${msg.item} na pos ${msg.pos}`,
          timestamp: new Date()
        });
      }
    });
    
    workers.push(worker);
  }
  
  // Criar threads consumidoras
  for (let i = 0; i < 100; i++) {
    const worker = new Worker(join(__dirname, 'consumidor-exp3.js'), {
      workerData: { 
        buffer: sharedBuffer,
        semaphores: semBuffer,
        id: i,
        bufferSize: BUFFER_SIZE
      }
    });
    
    worker.on('message', (msg) => {
      if (msg.tipo === 'consumo') {
        exp3Eventos.push({
          tipo: 'consumidor',
          id: msg.id,
          mensagem: `Consumiu ${msg.item} da pos ${msg.pos}`,
          timestamp: new Date()
        });
      }
    });
    
    workers.push(worker);
  }

  // Parar threads após 60 segundos
  setTimeout(() => {
    console.log('Encerrando Experimento 3...');
    workers.forEach(worker => worker.terminate());
    
    // Adicionar estatísticas finais
    const produzidos = exp3Eventos.filter(e => e.tipo === 'produtor').length;
    const consumidos = exp3Eventos.filter(e => e.tipo === 'consumidor').length;
    
    exp3Eventos.push({ 
      tipo: 'sistema', 
      mensagem: `Sistema encerrado. Produzidos: ${produzidos}, Consumidos: ${consumidos}`,
      timestamp: new Date() 
    });
  }, 60000);
}

// ============== INICIAR SERVIDOR ==============
app.listen(port, () => {
  console.log(`Backend com threads rodando em http://localhost:${port}`);
  console.log('Endpoints disponíveis:');
  console.log(`- GET /exp1/iniciar/:quantidade`);
  console.log(`- GET /exp2/iniciar`);
  console.log(`- GET /exp3/iniciar`);  // Endpoint do Experimento 3
});