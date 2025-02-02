import React from "react";

const Modal = ({ isOpen, onClose, title, description, children }: { isOpen: boolean, onClose: () => void, title: string, description: string, children: React.ReactNode}) => {
  if (!isOpen) return null; // Don't render if modal is not open
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {/* Content */}
        <div className="mb-4">{children}
          <p>{description}</p>
        </div>
        {/* Footer */}
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default Modal;