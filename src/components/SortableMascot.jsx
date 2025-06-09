import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LABEL_MAP } from '../data/questions'

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

  const type = id.split('-')[1].replace('.png', '')
  const lang = localStorage.getItem('lang') || 'nl'
  const label = LABEL_MAP[lang]?.[type] ?? 'Mascotte'
  const [fallback, setFallback] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-md
        flex portrait:flex-row landscape:flex-col
        items-center
        w-full h-full
        ${isDragging ? 'shadow-lg' : 'shadow-sm'}
        touch-none cursor-grab
      `}
    >
      {/* Rank number */}
      <div className='
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
      <div className='
        portrait:h-full portrait:w-20
        landscape:w-full landscape:h-[calc(100%-1rem)]
        flex items-center justify-center
        flex-shrink-0
      '
      >
        <img
          src={fallback ? 'mascots/missing.png' : src}
          alt={label}
          className='h-full w-full object-contain'
          onError={() => setFallback(true)}
          draggable={false}
        />
      </div>

      {/* Label */}
      <div className='
        portrait:pl-px portrait:flex-1
        landscape:w-full landscape:h-3
        landscape:text-center
        truncate
        text-[10px] leading-none
        text-gray-700 font-medium
      '
      >
        {label}
      </div>
    </div>
  )
}
