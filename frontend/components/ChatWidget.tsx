import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/gemini';
import { INITIAL_MESSAGE } from '../constants';
import ChatMessage from './ChatMessage';
import { Send, X, MessageCircle, Loader2, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'model',
      text: INITIAL_MESSAGE,
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isExpanded]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isExpanded]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare history for API
      // Filter out the initial UI-only message to avoid confusing the model with a message it didn't generate in this session
      const history = messages
        .filter(m => m.text !== INITIAL_MESSAGE)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const streamResult = await sendMessageToGemini(history, userText);
      
      // Create placeholder for bot response
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      let fullText = '';
      let groundingLinks: { title: string; url: string }[] = [];
      
      // Iterate directly over the streamResult (it is an async iterable)
      for await (const chunk of streamResult) {
        const chunkText = chunk.text; 
        if (chunkText) {
          fullText += chunkText;
        }

        // Extract grounding metadata if present
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
          chunks.forEach((c: any) => {
            if (c.web?.uri && c.web?.title) {
              // Avoid duplicates
              if (!groundingLinks.some(link => link.url === c.web.uri)) {
                groundingLinks.push({
                  title: c.web.title,
                  url: c.web.uri
                });
              }
            }
          });
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { 
            ...msg, 
            text: fullText,
            groundingLinks: groundingLinks.length > 0 ? groundingLinks : undefined
          } : msg
        ));
        scrollToBottom();
      }

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having a little trouble connecting right now. Take a deep breath and try again in a moment! 🌿",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed z-50 flex flex-col items-end transition-all duration-300 ${
      isOpen 
        ? (isExpanded ? 'inset-0' : 'inset-0 md:inset-auto md:bottom-6 md:right-6') 
        : 'bottom-6 right-6'
    }`}>
      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300 ${
          isExpanded 
            ? 'w-full h-full rounded-none' 
            : 'w-full h-full md:w-[500px] md:h-[600px] md:max-h-[80vh] md:rounded-2xl md:mb-4'
        }`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 flex justify-between items-center text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Sparkles size={18} className="text-yellow-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">BoardExamDost</h3>
                <p className="text-xs text-teal-100">Your Wellness Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors hidden md:block"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 scrollbar-hide">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-teal-500" />
                  <span className="text-sm text-slate-500">Mitra is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
            <div className="flex gap-2 items-end bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about stress, study tips, or motivation..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 text-sm py-2 px-2"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-slate-400">
                Mitra is an AI. For emergencies, call 14416 (Tele-MANAS).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'hidden md:flex bg-slate-700 rotate-90' 
            : 'flex bg-gradient-to-r from-teal-500 to-emerald-500 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={28} className="text-white animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
