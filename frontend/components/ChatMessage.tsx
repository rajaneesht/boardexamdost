import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Parse text for the special image tag <<IMAGE: keyword>>
  const { cleanText, imageKeyword } = useMemo(() => {
    const imgRegex = /<<IMAGE:\s*([a-zA-Z0-9]+)>>/;
    const match = message.text.match(imgRegex);
    if (match) {
      return {
        cleanText: message.text.replace(imgRegex, '').trim(),
        imageKeyword: match[1].toLowerCase()
      };
    }
    return { cleanText: message.text, imageKeyword: null };
  }, [message.text]);

  // Generate a deterministic but random-looking image URL based on keyword and message ID length
  const imageUrl = imageKeyword 
    ? `https://picsum.photos/seed/${imageKeyword}${message.id.slice(-3)}/400/250`
    : null;

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-teal-500'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col p-4 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
        }`}>
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
            <ReactMarkdown>{cleanText}</ReactMarkdown>
          </div>

          {/* Render Image if present */}
          {imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden shadow-md animate-float">
              <img 
                src={imageUrl} 
                alt="Motivational visual" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="bg-teal-50 text-teal-800 text-xs px-2 py-1 text-center font-medium">
                Visual Boost: {imageKeyword}
              </div>
            </div>
          )}

          {/* Render Grounding Links (Sources) */}
          {message.groundingLinks && message.groundingLinks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200/50">
              <p className="text-xs font-semibold mb-2 opacity-70 flex items-center gap-1">
                <ExternalLink size={10} /> Sources:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.groundingLinks.map((link, idx) => (
                  <a 
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 px-2 py-1 rounded-full border border-slate-200 transition-colors truncate max-w-[200px]"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <span className={`text-[10px] mt-2 block opacity-70 ${isUser ? 'text-indigo-100' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
