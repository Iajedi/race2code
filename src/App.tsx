import './App.css'
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import RacingGame from './pages/Racing';
import MCQ from './pages/MCQ';
import Programming from './pages/Programming';

const NotFound = () => <h2>404 - Page Not Found</h2>;

function App() {
  // const navigate = useNavigate();

  // useEffect(() => {
  //   navigate("/mcq"); // Auto-redirect to /mcq on load
  // }, [navigate]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <nav className="fixed top-0 w-full z-[100] justify-center items-center bg-black p-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/racing" element={<RacingGame numCheckpoints={5} topicId='' />} />
        <Route path="/mcq" element={<MCQ />} />
        <Route path="/programming" element={<Programming />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
