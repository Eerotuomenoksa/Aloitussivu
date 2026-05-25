import { useEffect, useRef, useState } from 'react';

export type SpeechState = 'idle' | 'listening' | 'unsupported';

interface UseSpeechInputOptions {
  locale: string;
  onResult: (text: string) => void;
  clearBeforeListen?: () => void;
}

export const useSpeechInput = ({ locale, onResult, clearBeforeListen }: UseSpeechInputOptions) => {
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechState('unsupported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = locale;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setSpeechState('idle');
    };
    recognition.onerror = () => setSpeechState('idle');
    recognition.onend = () => setSpeechState('idle');
    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [locale, onResult]);

  const toggleListening = () => {
    if (speechState === 'unsupported') return;

    if (speechState === 'listening') {
      recognitionRef.current?.stop();
      setSpeechState('idle');
      return;
    }

    clearBeforeListen?.();
    recognitionRef.current?.start();
    setSpeechState('listening');
  };

  return {
    speechState,
    isListening: speechState === 'listening',
    canListen: speechState !== 'unsupported',
    toggleListening,
  };
};
