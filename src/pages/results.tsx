import { Link } from "react-router-dom"
import "../App.css"

// Function to randomly generate a multiple-choice question
function Results() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-around min-h-screen bg-green-800 p-4 gap-4">
      <Link to="/game">
        <button>
          Start Game (Python Basics)
        </button>
      </Link>
    </div>
  )
}

export default Results
