import React, { useState, useEffect, useCallback, useRef } from 'react';
import './VoiceControl.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceControl({ onCommand, showToast }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const resultTranscript = event.results[current][0].transcript;
      setTranscript(resultTranscript);

      if (event.results[current].isFinal) {
        processCommand(resultTranscript.toLowerCase());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        showToast('Microphone access denied', 'error', '🚫');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [showToast]);

  const processCommand = useCallback((cmd) => {
    console.log('Processing command:', cmd);
    
    // Command mapping
    if (cmd.includes('play') && cmd.length < 10) {
      if (cmd === 'play' || cmd === 'play song' || cmd === 'play music') {
        onCommand({ type: 'PLAY' });
        return;
      }
    }

    if (cmd.includes('pause') || cmd.includes('stop')) {
      onCommand({ type: 'PAUSE' });
      return;
    }

    if (cmd.includes('next') || cmd.includes('skip')) {
      onCommand({ type: 'NEXT' });
      return;
    }

    if (cmd.includes('previous') || cmd.includes('back')) {
      onCommand({ type: 'PREV' });
      return;
    }

    if (cmd.startsWith('play ')) {
      const searchTerm = cmd.replace('play ', '').trim();
      if (searchTerm) {
        onCommand({ type: 'SEARCH_AND_PLAY', query: searchTerm });
        return;
      }
    }

    // Default: try to search if it sounds like a song request
    if (cmd.length > 3) {
      onCommand({ type: 'SEARCH_AND_PLAY', query: cmd });
    }
  }, [onCommand]);

  const toggleListening = () => {
    if (!isSupported) {
      showToast('Speech recognition not supported in this browser', 'warning', '⚠️');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <div className="voice-control-container">
      {isListening && (
        <div className="voice-status">
          {transcript ? (
            <span>Listening: <span className="voice-transcript">"{transcript}"</span></span>
          ) : (
            <span className="voice-hint">Say "Play", "Pause", or "Play [Song Name]"...</span>
          )}
        </div>
      )}
      <button 
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        title="Voice Commands"
      >
        {isListening ? '🎙️' : '🎤'}
      </button>
    </div>
  );
}
