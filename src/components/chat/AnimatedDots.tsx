import React from 'react';

const AnimatedDots: React.FC<{ className?: string }> = ({ className = '' }) => (
    <span className={`inline-flex items-center ${className}`} aria-label="Loading">
        <span className="animate-bounce [animation-delay:-0.32s] mx-0.5 w-2 h-2 bg-gray-400 rounded-full"></span>
        <span className="animate-bounce [animation-delay:-0.16s] mx-0.5 w-2 h-2 bg-gray-400 rounded-full"></span>
        <span className="animate-bounce mx-0.5 w-2 h-2 bg-gray-400 rounded-full"></span>
    </span>
);

export default AnimatedDots;