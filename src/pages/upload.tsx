// src/pages/Upload.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.name.endsWith('.py')) {
      setFile(uploadedFile);
    } else {
      alert('Please upload a valid Python file (.py).');
    }
  };

  // Handle proceeding to the TalkBot page
  const handleProceed = () => {
    if (file) {
      navigate('/talkbot', { state: { file } });
    } else {
      alert('Please upload a Python file first.');
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black font-sans">
      <h2 className="text-2xl font-bold text-white mb-4">Upload Python File</h2>
      <input
        type="file"
        accept=".py"
        onChange={handleFileUpload}
        className="mb-4"
      />
      <button
        onClick={handleProceed}
        disabled={!file}
        className={`px-6 py-2 rounded ${
          file ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'
        } text-white`}
      >
        Proceed
      </button>
    </div>
  );
};

export default Upload;