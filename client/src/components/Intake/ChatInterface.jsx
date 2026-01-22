import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../../services/intake';
import './ChatInterface.css';

const ChatInterface = ({ messages, onSendMessage, isLoading, isComplete }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isComplete) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        // Transcribe the audio
        setIsTranscribing(true);
        setVoiceError(null);
        try {
          const result = await transcribeAudio(audioBlob);
          if (result.transcript) {
            setInput(prev => prev ? `${prev} ${result.transcript}` : result.transcript);
          }
        } catch (err) {
          console.error('Transcription failed:', err);
          const errorData = err.response?.data;

          if (errorData?.error === 'DEEPGRAM_NO_CREDITS') {
            setVoiceError('⚠️ DEEPGRAM CREDITS EXHAUSTED - Add credits at deepgram.com');
          } else if (errorData?.error === 'DEEPGRAM_AUTH_ERROR') {
            setVoiceError('⚠️ DEEPGRAM API KEY ERROR - Check your API key');
          } else {
            setVoiceError('Voice transcription failed. Please type instead.');
          }

          // Clear error after 8 seconds
          setTimeout(() => setVoiceError(null), 8000);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🏋️'}
            </div>
            <div className="message-content">
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-avatar">🏋️</div>
            <div className="message-content">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {voiceError && (
        <div className="voice-error">
          {voiceError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading || isComplete || isTranscribing}
          className={`chat-mic-button ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isTranscribing ? '...' : isRecording ? '⏹' : '🎤'}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isTranscribing ? "Transcribing..." : isRecording ? "Listening..." : isComplete ? "Intake complete!" : "Type or tap mic to speak..."}
          disabled={isLoading || isComplete || isRecording}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isComplete || isRecording}
          className="chat-send-button"
        >
          {isLoading ? '...' : '→'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
