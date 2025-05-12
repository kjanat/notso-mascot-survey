
import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

export default function SortableMascot({id,src,rank}){
 const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id});
 const style={transform:CSS.Transform.toString(transform),transition,opacity:isDragging?0.6:1};
 return(<div ref={setNodeRef} style={style} {...attributes}{...listeners} className="bg-white rounded-xl shadow p-4 flex items-center space-x-4 cursor-grab">
  <span className="font-bold w-6 text-center">{rank}</span>
  <img src={src} alt={id} className="w-16 h-16 object-contain"/>
  <span className="text-gray-700 flex-1">{id.replace(/[-_]/g,' ')}</span>
 </div>);
}
