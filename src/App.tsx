import './App.css'
import VoiceWidget from "../components/VoiceWidget";
// <<<<<<< HEAD
// import { Routes, Route, Link, useNavigate } from "react-router-dom";
// import RacingGame from './pages/Racing';
// import MCQ from './pages/MCQ';
// import Programming from './pages/Programming';
import Home from './pages/home';
// =======
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import MCQ from './pages/MCQ';
import Programming from './pages/Programming';
import StartScreen from './pages/StartScreen';
import CourseSelection from './pages/CourseSelection';
import TalkBot from './pages/TalkBot';
import GameWrapper from './pages/game';
import Upload from './pages/upload';

const NotFound = () => <h2>404 - Page Not Found</h2>;

function App() {
  // const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center min-h-screen">
      {/* <nav className="mb-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about">About</Link>
      </nav> */}

      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/game" element={<GameWrapper/>} />
        <Route path="/mcq" element={<MCQ />} />
        <Route path="/programming" element={<Programming />} />
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<CourseSelection />} />
        <Route path="/talkbot" element={<TalkBot />} />
        <Route path="/upload" element={<Upload />} />
        {/* <Route path="/game" element={<GameWrapper />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
