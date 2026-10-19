'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/services/http';

const useSpeechSynthesis = ({ lang = 'es-AR' } = {}) => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const audioRef = useRef(null);
  const requestRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    setSupported(typeof Audio !== 'undefined');
    return () => {
      requestRef.current?.abort();
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const browserFallback = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) {
      setSpeaking(false);
      onEnd?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.startsWith('es') && /Google|Natural|Elena|Microsoft/i.test(voice.name)) || voices.find((voice) => voice.lang.startsWith('es')) || null;
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 0.92;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => { setSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  const speak = useCallback(async (text, onEnd) => {
    if (!text?.trim()) return;
    requestRef.current?.abort();
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    const controller = new AbortController();
    requestRef.current = controller;
    setSpeaking(true);

    try {
      const response = await api.post('/api/ia/speech', { text }, {
        responseType: 'blob',
        signal: controller.signal,
      });
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(response.data);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
        objectUrlRef.current = null;
        onEnd?.();
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
        objectUrlRef.current = null;
        browserFallback(text, onEnd);
      };
      await audio.play();
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
      browserFallback(text, onEnd);
    }
  }, [browserFallback]);

  const cancel = useCallback(() => {
    requestRef.current?.abort();
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speak, speaking, cancel };
};

export default useSpeechSynthesis;
