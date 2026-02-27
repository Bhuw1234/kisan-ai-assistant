import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: 'en-US' | 'hi-IN';
  isListening?: boolean;
  setIsListening?: (listening: boolean) => void;
}

export default function VoiceInput({ 
  onTranscript, 
  language = 'en-US',
  isListening: externalIsListening,
  setIsListening: externalSetIsListening
}: VoiceInputProps) {
  const [internalIsListening, setInternalIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const isListening = externalIsListening ?? internalIsListening;
  const setIsListening = externalSetIsListening ?? setInternalIsListening;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language, onTranscript, setIsListening]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`p-4 rounded-2xl transition-all active:scale-95 ${
        isListening 
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30 ring-4 ring-red-500/20' 
          : 'bg-emerald-100 text-emerald-700 shadow-sm hover:bg-emerald-200 border border-emerald-200/60'
      }`}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
}
