import NavButton from '../components/NavButton';

const CourseSelection: React.FC = () => {

  // const topics: { [key: string]: string } = {
  //   "programmingBasics":"Programming Basics",
  //   "pythonBasics": "Python Basics",
  //   "cBasics": "C Basics",
  // }
  const topics: string[] = [
    "Programming Basics",
    "Python Basics",
    "C Basics",
    "Java Data Structure Basics"
  ]

  const topicButtons = []
  for (let key in topics) {
    topicButtons.push(<NavButton destination={`/game?topic=${topics[key]}`} className='mx-3'> {topics[key]} </NavButton>)

  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <NavButton destination='/' className='absolute top-4 left-4 z-30'>
        Back
      </NavButton>

      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          Choose Your Course
        </h1>

        <p className="text-xl text-gray-300 mb-8">
          Which topic would you like to learn about
        </p>
        {topicButtons}
      </div>
    </div>
  );
};

export default CourseSelection;
