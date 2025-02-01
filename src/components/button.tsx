import React from 'react';

interface ButtonProps {
  onClick: () => void; // Function to handle the button click
  children: React.ReactNode; // Content inside the button
  className?: string; // Optional additional classes
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 bg-red-600 text-white text-2xl rounded-lg
                  hover:bg-red-700 transition-all duration-300 ease-in-out
                  transform hover:scale-105 hover:shadow-xl
                  border-2 border-red-400 ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default Button;