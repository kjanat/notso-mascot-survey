import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableMascot ({ id, src, rank }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1
  }

  const [fallback, setFallback] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-md
        flex portrait:flex-row portrait:justify-center landscape:flex-col
        items-center
        w-full h-full
        ${isDragging ? 'shadow-lg' : 'shadow-sm'}
        touch-none cursor-grab
      `}
    >
      {/* Rank number */}
      <div
        className='
        absolute -top-2 -left-2
        bg-blue-600 text-white
        w-5 h-5
        flex items-center justify-center
        rounded-full text-xs font-bold
        border-2 border-white
        shadow-sm
        z-10
      '
      >
        {rank}
      </div>

      {/* Image container */}
      <div
        className='
        portrait:h-full portrait:w-20 portrait:mx-auto
        landscape:w-full landscape:h-[calc(100%-1rem)]
        flex items-center justify-center
        flex-shrink-0
      '
      >
        <img
          src={fallback ? 'mascots/missing.webp' : src}
          alt='Mascot'
          className='h-full w-full object-contain portrait:max-w-full'
          onError={() => setFallback(true)}
          draggable={false}
        />
      </div>
    </div>
  )
}
