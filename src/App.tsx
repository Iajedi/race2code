import './App.css'
import { Routes, Route, Link } from "react-router-dom";
import Racing from './pages/Racing';
import MCQ from './pages/MCQ';
import Programming from './pages/Programming';
import StartScreen from './pages/StartScreen';
import CourseSelection from './pages/CourseSelection';

const NotFound = () => <h2>404 - Page Not Found</h2>;

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <nav className="fixed top-0 w-full z-[100] justify-center items-center bg-black p-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/racing" element={<Racing numCheckpoints={5} topicId='' />} />
        <Route path="/mcq" element={<MCQ />} />
        <Route path="/programming" element={<Programming />} />
        <Route path="/courses" element={<CourseSelection />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
