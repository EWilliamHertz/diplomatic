import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', className = '' }: { width?: string; height?: string; className?: string }) => {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ width, height }} 
    />
  );
};
