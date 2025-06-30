import React from 'react';

const AnimatedDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex items-center ${className}`} aria-label="Loading">
    <span className="mx-0.5 h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.32s]"></span>
    <span className="mx-0.5 h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.16s]"></span>
    <span className="mx-0.5 h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
  </span>
);

export default AnimatedDots;
