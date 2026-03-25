// hooks/useSpeechSynthesis.js
'use client';

import { useState, useEffect, useCallback } from 'react';

const useSpeechSynthesis = (props = {}) => {
  const { lang = 'es-ES' } = props;
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  const processVoices = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter(voice => voice.lang.includes(lang));
    setVoices(spanishVoices);
  }, [lang]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      processVoices();
      window.speechSynthesis.onvoiceschanged = processVoices;
    }
  }, [processVoices]);

  const speak = useCallback((text) => {
    if (!supported || speaking) return;
    
    // Cancelar cualquier voz anterior para evitar solapamientos
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Intentar encontrar una voz de alta calidad
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Elena'));
    utterance.voice = preferredVoice || voices[0];
    utterance.lang = lang;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [supported, speaking, voices, lang]);

  const cancel = useCallback(() => {
    if (!supported) return;
    setSpeaking(false);
    window.speechSynthesis.cancel();
  }, [supported]);

  return { supported, speak, speaking, cancel };
};

export default useSpeechSynthesis;