import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/Intake/ChatInterface';
import { startIntake, sendMessage } from '../services/intake';
import { generateProgram } from '../services/program';
import { useAuth } from '../context/AuthContext';
import './IntakePage.css';

const IntakePage = () => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initializeIntake();
  }, []);

  const initializeIntake = async () => {
    try {
      setIsLoading(true);
      const data = await startIntake();
      setConversationId(data.conversation_id);
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to start intake conversation. Please try again.');
      console.error('Intake start error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    const userMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await sendMessage(conversationId, message);

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.completed) {
        setIsComplete(true);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setMessages(prev => prev.slice(0, -1));
      console.error('Message send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProgram = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      await generateProgram(conversationId);
      navigate('/app');
    } catch (err) {
      setGenerationError('Failed to generate program. Please try again.');
      console.error('Program generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="intake-container">
      <header className="intake-header">
        <h1 className="intake-logo">MyFitnessCoachAI</h1>
        <button onClick={handleLogout} className="logout-button">Sign Out</button>
      </header>

      <main className="intake-main">
        <div className="intake-info">
          <h2>Let's Get to Know You</h2>
          <p>
            Have a conversation with your AI coach to create a personalized
            fitness program tailored specifically to your goals and situation.
          </p>
        </div>

        {error && (
          <div className="intake-error">
            {error}
            <button onClick={initializeIntake}>Retry</button>
          </div>
        )}

        <div className="chat-wrapper">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isComplete={isComplete}
          />
        </div>

        {isComplete && (
          <div className="intake-complete">
            {isGenerating ? (
              <>
                <div className="generating-spinner"></div>
                <p>Creating your personalized workout, nutrition, and flexibility programs...</p>
                <p className="generating-note">This may take a moment as we customize everything for you.</p>
              </>
            ) : (
              <>
                {generationError && (
                  <p className="generation-error">{generationError}</p>
                )}
                <p>Your intake is complete! Ready to generate your personalized programs.</p>
                <button onClick={handleGenerateProgram} className="continue-button">
                  Generate My Programs
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default IntakePage;
