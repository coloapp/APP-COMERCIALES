import React from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Generating...' }) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50 rounded-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p className="mt-4 text-gray-800 text-lg font-semibold">{message}</p>
    </div>
  );
};

export default Loader;