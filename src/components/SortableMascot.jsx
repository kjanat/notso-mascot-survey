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

  /* label via bestandsnaam (topic-type.png) */
  const type = id.split("-")[1].replace(".png", "");
  const label = LABEL_MAP[type] ?? "Mascotte";

  /* éénmalige fallback */
  const [fallback, setFallback] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-lg shadow-sm
        flex items-center sm:flex-col gap-2 p-3
        w-full sm:w-52 border border-gray-100
        ${isDragging ? 'shadow-lg' : 'hover:shadow-md'}
        touch-none cursor-grab
      `}
    >
      {/* nummer-badge */}
      <span
        className="
          absolute -top-2 -left-2 bg-blue-600 text-white
          w-6 h-6 flex items-center justify-center
          rounded-full text-sm font-medium shadow-sm
        "
      >
        {rank}
      </span>

      {/* afbeelding */}
      <div
        className="
          w-16 h-16
          sm:w-full sm:h-40
          bg-gray-50 flex items-center justify-center 
          rounded-lg overflow-hidden
          border border-gray-100
        "
      >
        <img
          src={fallback ? "/mascots/missing.png" : src}
          alt={label}
          className="w-full h-full object-contain p-2"
          onError={() => setFallback(true)}
          draggable={false}
        />
      </div>

      {/* label */}
      <span className="text-sm sm:text-base font-medium truncate sm:mt-1 text-gray-700">
        {label}
      </span>
    </div>
  );
}
