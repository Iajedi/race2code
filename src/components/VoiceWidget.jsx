import {useEffect, useState} from "react";
import {usePorcupine} from "@picovoice/porcupine-react";
import { heyJarvisKeywordModel } from "../hey_jarvis";
import modelParams from "../porcupine_params";

const PORCUPINE_API_KEY = 'rueaSDF1gJ9QvDj7s2Xt+YioYqyk/b0Gh1nfMP4R66tK73ssB9EOTA==';

export default function VoiceWidget() {
  const [keywordDetections, setKeywordDetections] = useState([]);


  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release
  } = usePorcupine();


  const initEngine = async () => {
    await init(
      PORCUPINE_API_KEY,
      [{
        base64: heyJarvisKeywordModel,
        label: "Hey Jarvis"
      }],
      {base64: modelParams}
    );
    start()
  }


  useEffect(() => {
    if (keywordDetection !== null) {
      setKeywordDetections((oldVal) =>
        [...oldVal, keywordDetection.label])
    }
  }, [keywordDetection])


  return (
    <div className="voice-widget">
      <h3>
        <label>
          <button
            className="init-button"
            onClick={() => initEngine()}
          >
            Start
          </button>
        </label>
      </h3>
      {keywordDetections.length > 0 && (
        <ul>
          {keywordDetections.map((label, index) => (
            <li key={index}>{label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
