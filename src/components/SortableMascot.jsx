import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LABEL_MAP } from "../data/questions";

export default function SortableMascot({ id, src, rank }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1
  };

  const type = id.split("-")[1].replace(".png", "");
  const label = LABEL_MAP[type] ?? "Mascotte";
  const [fallback, setFallback] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-lg shadow-sm
        flex flex-col [@media(max-width:640px)_and_(orientation:portrait)]:flex-row items-center gap-2 p-3
        w-full border border-gray-100
        ${isDragging ? 'shadow-lg' : 'hover:shadow-md'}
        touch-none cursor-grab
      `}
    >
      <span className="
        absolute -top-2 -left-2 bg-blue-600 text-white
        w-6 h-6 flex items-center justify-center
        rounded-full text-sm font-medium shadow-sm z-10
      ">
        {rank}
      </span>

      <div className="
        w-full aspect-square
        [@media(max-width:640px)_and_(orientation:portrait)]:w-16
        [@media(max-width:640px)_and_(orientation:portrait)]:h-16
        bg-gray-50 flex items-center justify-center 
        rounded-lg overflow-hidden
        border border-gray-100
      ">
        <img
          src={fallback ? "/mascots/missing.png" : src}
          alt={label}
          className="w-full h-full object-contain p-2"
          onError={() => setFallback(true)}
          draggable={false}
        />
      </div>

      <span className="
        portrait:flex-1 landscape:w-full
        text-sm font-medium truncate
        text-gray-700 landscape:text-center
      ">
        {label}
      </span>
    </div>
  );
}
