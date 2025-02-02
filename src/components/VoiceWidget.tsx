import React, { useEffect } from "react";
import { usePorcupine } from "@picovoice/porcupine-react";


function VoiceWidget(props) {
  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  } = usePorcupine();


  const porcupineKeyword = { 
      publicPath: "${KEYWORD_FILE_PATH}",
      label: "${KEYWORD_LABEL}" // An arbitrary string used to identify the keyword once the detection occurs.
  }
  const porcupineModel = { publicPath: "${MODEL_FILE_PATH}" }


  useEffect(() => {
    init(
      "${ACCESS_KEY}",
      porcupineKeyword,
      porcupineModel
    );
  }, []);


  useEffect(() => {
    if (keywordDetection !== null) {
      // ... use keyword detection result
    }
  }, [keywordDetection]);


  // ... render component
}
