import { useState, useRef, useEffect } from 'react';
import { chat } from '../services/api';
import './ChatBot.css';

function ChatBot({ prescriptionId }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! 👋 I\'m your Prescripto assistant. I can help you understand your prescription. Ask me anything about your medicines, dosages, or any medical terms you don\'t understand.',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true); // Start minimized
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        // Add user message
        const userMessage = { role: 'user', content: trimmedInput };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat(trimmedInput, prescriptionId);
            const assistantMessage = {
                role: 'assistant',
                content: response.data.response,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                isError: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedQuestions = [
        'What are the side effects?',
        'When should I take this?',
        'Can I take this with food?',
        'What if I miss a dose?',
    ];

    const handleSuggestionClick = (question) => {
        setInput(question);
        inputRef.current?.focus();
    };

    if (isMinimized) {
        return (
            <button className="chatbot-fab" onClick={() => setIsMinimized(false)}>
                <span className="fab-icon">💬</span>
                <span className="fab-text">Chat</span>
            </button>
        );
    }

    return (
        <div className="chatbot">
            <div className="chatbot-header">
                <div className="chatbot-title">
                    <span className="chatbot-avatar">🤖</span>
                    <div>
                        <h4>Prescripto Assistant</h4>
                        <span className="chatbot-status">
                            {isLoading ? 'Typing...' : 'Online'}
                        </span>
                    </div>
                </div>
                <button className="chatbot-minimize" onClick={() => setIsMinimized(true)}>
                    ─
                </button>
            </div>

            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
                    >
                        {msg.role === 'assistant' && (
                            <span className="message-avatar">🤖</span>
                        )}
                        <div className="message-content">
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message assistant">
                        <span className="message-avatar">🤖</span>
                        <div className="message-content typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
                <div className="chatbot-suggestions">
                    <p className="suggestions-label">Quick questions:</p>
                    <div className="suggestions-list">
                        {suggestedQuestions.map((q, i) => (
                            <button
                                key={i}
                                className="suggestion-btn"
                                onClick={() => handleSuggestionClick(q)}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="chatbot-input">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask about your prescription..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ChatBot;
