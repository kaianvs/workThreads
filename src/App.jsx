// src/App.jsx
import  { useState } from 'react';
import Experimento1 from './components/Experiment';
import Experimento2 from './components/ProdCons';
import Experimento3 from './components/Experiment3'; 
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css';
import './experimento3.css'
function App() {
  const [experimentoAtivo, setExperimentoAtivo] = useState(null);

  return (
    <div className="w-screen h-screen bg-slate-950 overflow-auto">
      <Header/>
      <nav className='p-8'>
        <button className='bg-lime-600 p-3 cursor-pointer hover:bg-lime-400 transition duration-400 rounded-2xl text-white font-bold font-sora' onClick={() => setExperimentoAtivo(null)}>Menu Principal</button>
      </nav>
      
      <main>
       

        {experimentoAtivo === null ? (
           
           
          <div className='p-6'>
              <h2 className='text-white font-bold font-sora'>Escolha um experimento:</h2>
            <div className=" grid grid-cols-3 grid-rows-1 gap-4 p-8">
              <div className="bg-blue-900 rounded-2xl p-8 cursor-pointer text-white shadow-2xl 
              transition duration-500  hover:-translate-y-2" onClick={() => setExperimentoAtivo(1)}>
                <h3 className='font-sora'>Experimento 1: Processos Pai e Filhos</h3>
                <p className='font-sora'>Criação de processos filhos com comunicação</p>
              </div>
              <div className="bg-blue-900 rounded-2xl p-8 cursor-pointer text-white shadow-2xl 
              transition duration-500  hover:-translate-y-2" onClick={() => setExperimentoAtivo(2)}>
                <h3>Experimento 2: Produtores e Consumidores</h3>
                <p>Sincronização com buffer compartilhado</p>
              </div>
              <div className="bg-blue-900 rounded-2xl p-8 cursor-pointer text-white shadow-2xl 
              transition duration-500  hover:-translate-y-2" onClick={() => setExperimentoAtivo(3)}>
                <h3>Experimento 3: 200 Threads com Semáforos</h3>
                <p>100 produtores e 100 consumidores usando semáforos</p>
            </div>
          </div>
          </div>
        ) : experimentoAtivo === 1 ? (
          <Experimento1 />
        ) : experimentoAtivo === 2 ? (
          <Experimento2 />
        ) : (
          <Experimento3 />
        )}
      </main>
      
      <Footer/>
    </div>
  );
}

export default App;