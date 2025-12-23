import React from 'react';

export default function Tooltip({ text, children }) {
  return (
    <span className="relative inline-flex group" aria-label={text} title={text}>
      {children}
      <span className="pointer-events-none invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">{text}</span>
    </span>
  );
}
