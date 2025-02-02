import React from 'react';
import { Link } from 'react-router-dom';

interface NavButtonProps {
  destination: string; // Function to handle the button click
  children: React.ReactNode; // Content inside the button
  className?: string; // Optional additional classes
}

const NavButton: React.FC<NavButtonProps> = ({ destination, children, className }) => {
  return (
    <Link to={destination}>
      <button
        className={`px-8 py-4 bg-red-600 text-white text-2xl rounded-lg
                    hover:bg-red-700 transition-all duration-300 ease-in-out
                    transform hover:scale-105 hover:shadow-xl
                    border-2 border-red-400 ${className || ''}`}
      >
        {children}
      </button>
    </Link>
  );
};

export default NavButton;