import './App.css'
// <<<<<<< HEAD
// import { Routes, Route, Link, useNavigate } from "react-router-dom";
// import RacingGame from './pages/Racing';
// import MCQ from './pages/MCQ';
// import Programming from './pages/Programming';
import Home from './pages/home';
import GameWrapper from './pages/game';
// =======
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Racing from './pages/Racing';
import MCQ from './pages/MCQ';
import Programming from './pages/Programming';
import StartScreen from './pages/StartScreen';
import CourseSelection from './pages/CourseSelection';

const NotFound = () => <h2>404 - Page Not Found</h2>;

function App() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* <nav className="mb-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about">About</Link>
      </nav> */}

      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/racing" element={<Racing numCheckpoints={5} topicId='' />} />
        <Route path="/mcq" element={<MCQ />} />
        <Route path="/programming" element={<Programming />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game" element={<GameWrapper />} />
        <Route path="/courses" element={<CourseSelection />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
