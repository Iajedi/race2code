import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from '../components/NavButton';

const Upload: React.FC = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.name.endsWith('.py')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFileContent(e.target.result as string);
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      alert('Please upload a valid Python file (.py).');
    }
  };

  // Handle proceeding to the TalkBot page
  const handleProceed = () => {
    if (fileContent) {
      navigate('/talkbot', { state: { code: fileContent } });
    } else {
      alert('Please upload a Python file first.');
    }
  };

  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setFileName(event.target.files[0].name);
      handleFileUpload(event);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <NavButton destination='/' className='absolute top-4 left-4 z-30'>
        Back
      </NavButton>

      <h2 className="text-2xl font-bold text-white mb-4">Upload Python File</h2>
      <div className="flex flex-col items-center justify-center gap-2">
        {/* Hidden file input */}
        <input
          type="file"
          accept=".py"
          onChange={handleChange}
          className="hidden"
          id="fileInput"
        />

        {/* Styled Button */}
        <label
          htmlFor="fileInput"
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Upload Python File
        </label>

        {/* Show selected file name */}
        {fileName && <p className="text-gray-700 mt-2">{fileName}</p>}
      </div>
      <button
        onClick={handleProceed}
        disabled={!fileContent}
        className={`px-6 py-2 rounded ${fileContent ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'
          } text-white`}
      >
        Proceed
      </button>
    </div>
  );
};

export default Upload;
