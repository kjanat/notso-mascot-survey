
import React,{useState,useEffect} from 'react';
import {DndContext,PointerSensor,useSensor,useSensors} from '@dnd-kit/core';
import {SortableContext,verticalListSortingStrategy} from '@dnd-kit/sortable';
import QUESTIONS from './data/questions';
import SortableMascot from './components/SortableMascot';

export default function App(){
 const sensors=useSensors(useSensor(PointerSensor));
 const [step,setStep]=useState('intro');
 const [answers,setAnswers]=useState({});
 const [order,setOrder]=useState([]);
 const [form,setForm]=useState({age:'',gender:'',education:''});
 const [submitted,setSubmitted]=useState(false);

 useEffect(()=>{if(typeof step==='number'){setOrder(QUESTIONS[step].options);}},[step]);

 function handleDragEnd(e){
  const {active,over}=e;
  if(!over||active.id===over.id)return;
  const oldIndex=order.indexOf(active.id);
  const newIndex=order.indexOf(over.id);
  const newOrder=[...order];
  newOrder.splice(oldIndex,1);
  newOrder.splice(newIndex,0,active.id);
  setOrder(newOrder);
 }

 function next(){
  if(typeof step==='number'){
    setAnswers(prev=>({...prev,[QUESTIONS[step].id]:order}));
    if(step<QUESTIONS.length-1){setStep(step+1);}else{setStep('form');}
  }
 }

 function back(){if(typeof step==='number'&&step>0){setStep(step-1);} }

 async function submit(){
   const orderStrings=Object.fromEntries(Object.entries(answers).map(([qid,arr])=>{
     const orig=QUESTIONS.find(q=>q.id===qid).options;
     return[qid,arr.map(opt=>orig.indexOf(opt)+1).join('')];
   }));
   const payload={data:{...form,...orderStrings,timestamp:new Date().toISOString()}};
   await fetch("https://sheetdb.io/api/v1/h1bwcita99si3",{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   setSubmitted(true);
 }

 /* Screens */
 if(submitted) return <div className="p-8 text-center text-xl">Bedankt voor je deelname! 🎉</div>;

 if(step==='intro') return(
  <div className="max-w-lg mx-auto p-8 text-center space-y-6">
   <h1 className="text-3xl font-bold">Mascotte‑Survey</h1>
   <p className="text-gray-700">We gaan je <strong>10 korte vragen</strong> stellen. Rangschik per vraag de mascottes van <strong>1 (best)</strong> tot 4.</p>
   <button onClick={()=>setStep(0)} className="mt-4 bg-green-600 text-white py-3 px-8 rounded hover:bg-green-700">Start</button>
  </div>);

 if(step==='form') return(
  <div className="max-w-md mx-auto p-8 space-y-4">
    <h2 className="text-2xl font-semibold text-center">Nog een paar vragen over jou 🙂</h2>
    <input type="number" min="1" max="99" placeholder="Leeftijd" className="w-full p-3 border rounded" onChange={e=>setForm({...form,age:e.target.value})}/>
    <label className="block text-left">
      <span className="text-gray-700">Geslacht</span>
      <select className="w-full mt-1 p-3 border rounded" onChange={e=>setForm({...form,gender:e.target.value})} defaultValue="">
        <option value="" disabled>Kies een optie</option><option value="Man">Man</option><option value="Vrouw">Vrouw</option><option value="Anders">Anders</option>
      </select>
    </label>
    <label className="block text-left">
      <span className="text-gray-700">Hoogst behaalde opleiding</span>
      <select className="w-full mt-1 p-3 border rounded" onChange={e=>setForm({...form,education:e.target.value})} defaultValue="">
        <option value="" disabled>Kies een optie</option><option value="Basisonderwijs">Basisonderwijs</option><option value="VMBO/MBO">VMBO / MBO</option><option value="HAVO">HAVO</option><option value="VWO">VWO</option><option value="HBO">HBO</option><option value="WO">WO (Universiteit)</option>
      </select>
    </label>
    <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">Versturen</button>
  </div>);

 const q=QUESTIONS[step];
 return(<div className="max-w-lg mx-auto p-8 space-y-6">
  <h1 className="text-2xl font-bold">{q.context}</h1>
  <p className="text-sm text-gray-600">Sleep om te rangschikken: <strong>1 = beste</strong></p>
  <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
    <SortableContext items={order} strategy={verticalListSortingStrategy}>
      <div className="space-y-2">
        {order.map((src,index)=><SortableMascot key={src} id={src} src={"/mascots/"+src} rank={index+1}/>)}
      </div>
    </SortableContext>
  </DndContext>
  <div className="flex justify-between">
    <button onClick={back} disabled={step===0} className="bg-gray-300 text-gray-800 py-2 px-4 rounded disabled:opacity-50">Terug</button>
    <button onClick={next} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">{step<QUESTIONS.length-1?'Volgende':'Achtergrondvragen'}</button>
  </div>
 </div>);
}
