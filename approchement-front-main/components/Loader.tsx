
import React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-slate-700 font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
