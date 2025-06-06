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
  // Get the language from localStorage, defaulting to 'nl'
  const lang = localStorage.getItem('lang') || 'nl';
  const label = LABEL_MAP[lang]?.[type] ?? "Mascotte";
  const [fallback, setFallback] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-lg shadow-sm
        flex flex-col [@media(max-width:640px)_and_(orientation:portrait)]:flex-row items-center
        w-full border border-gray-100
        p-3 gap-2
        ${isDragging ? 'shadow-lg' : 'hover:shadow-md'}
        touch-none cursor-grab
      `}
    >
      <span className="
        absolute -top-2 -left-2 bg-blue-600 text-white
        w-6 h-6 flex items-center justify-center
        rounded-full text-sm font-medium shadow-sm z-20
      ">
        {rank}
      </span>

      <div className="
        relative
        w-full aspect-square
        [@media(max-width:640px)_and_(orientation:portrait)]:w-16
        [@media(max-width:640px)_and_(orientation:portrait)]:h-16
      ">
        <img
          src={fallback ? "mascots/missing.jpg" : src}
          alt={label}
          className="w-full h-full object-contain"
          onError={() => setFallback(true)}
          draggable={false}
        />
      </div>

      <span className="
        min-h-[1.5rem]
        [@media(max-width:640px)_and_(orientation:portrait)]:flex-1
        text-sm font-medium
        text-gray-700 text-center
      ">
        {label}
      </span>
    </div>
  );
}
