import React, { useState, useRef, useEffect } from 'react';
import { startProfileUpdate, sendProfileUpdateMessage, confirmProfileUpdate } from '../../services/profileUpdate';
import { transcribeAudio } from '../../services/intake';
import './ProfileUpdateDrawer.css';

const ProfileUpdateDrawer = ({ isOpen, onClose, onUpdateComplete }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedChanges, setExtractedChanges] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [conversationId, setConversationId] = useState(null);
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
    if (!isLoading && inputRef.current && isOpen && !isComplete) {
      inputRef.current.focus();
    }
  }, [isLoading, isOpen, isComplete]);

  // Start conversation when drawer opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeConversation();
    }
  }, [isOpen, messages.length]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput('');
      setIsComplete(false);
      setExtractedChanges(null);
      setShowConfirmation(false);
      setConversationId(null);
    }
  }, [isOpen]);

  const initializeConversation = async () => {
    setIsLoading(true);
    try {
      const data = await startProfileUpdate();
      setConversationId(data.conversation_id);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to start profile update:', err);
      setMessages([{
        role: 'assistant',
        content: 'Sorry, I couldn\'t start the update session. Please make sure you\'ve completed an intake first.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isComplete) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI
    const newMessages = [...messages, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }];
    setMessages(newMessages);

    setIsLoading(true);
    try {
      const response = await sendProfileUpdateMessage(conversationId, userMessage, messages);

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      }]);

      if (response.completed) {
        setIsComplete(true);
        setExtractedChanges(response.extracted_changes);
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (regeneratePrograms) => {
    setIsConfirming(true);
    try {
      const result = await confirmProfileUpdate(messages, extractedChanges, regeneratePrograms);

      if (result.success) {
        onUpdateComplete?.(result);
        onClose();
      }
    } catch (err) {
      console.error('Failed to confirm update:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Voice recording functions
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

        setIsTranscribing(true);
        setVoiceError(null);
        try {
          const result = await transcribeAudio(audioBlob);
          if (result.transcript) {
            setInput(prev => prev ? `${prev} ${result.transcript}` : result.transcript);
          }
        } catch (err) {
          console.error('Transcription failed:', err);
          setVoiceError('Voice transcription failed. Please type instead.');
          setTimeout(() => setVoiceError(null), 5000);
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

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="profile-update-drawer">
        <div className="drawer-header">
          <h2>Quick Profile Update</h2>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          <div className="drawer-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`drawer-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
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
              <div className="drawer-message assistant-message">
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

          {showConfirmation ? (
            <div className="confirmation-panel">
              <h3>Save Your Changes?</h3>
              {extractedChanges?.summary && (
                <p className="changes-summary">{extractedChanges.summary}</p>
              )}
              {extractedChanges?.suggests_regeneration && (
                <p className="regenerate-note">
                  These changes may affect your workout program.
                </p>
              )}
              <div className="confirmation-buttons">
                <button
                  className="confirm-btn"
                  onClick={() => handleConfirm(false)}
                  disabled={isConfirming}
                >
                  {isConfirming ? 'Saving...' : 'Save Changes'}
                </button>
                {extractedChanges?.suggests_regeneration && (
                  <button
                    className="confirm-btn regenerate"
                    onClick={() => handleConfirm(true)}
                    disabled={isConfirming}
                  >
                    {isConfirming ? 'Saving...' : 'Save & Regenerate Programs'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="drawer-input-form">
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isLoading || isComplete || isTranscribing}
                className={`drawer-mic-button ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isTranscribing ? '...' : isRecording ? '⏹' : '🎤'}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isTranscribing ? 'Transcribing...' :
                  isRecording ? 'Listening...' :
                  isComplete ? 'Update complete!' :
                  'Type or tap mic to speak...'
                }
                disabled={isLoading || isComplete || isRecording}
                className="drawer-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isComplete || isRecording}
                className="drawer-send-button"
              >
                {isLoading ? '...' : '→'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileUpdateDrawer;
