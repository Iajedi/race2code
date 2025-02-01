import './App.css'
import { Routes, Route, Link } from "react-router-dom";
import RacingGame from './pages/Racing';
import MCQ from './pages/MCQ';

const NotFound = () => <h2>404 - Page Not Found</h2>;

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <nav className="mb-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/racing" element={<RacingGame />} />
        <Route path="/mcq" element={<MCQ />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
