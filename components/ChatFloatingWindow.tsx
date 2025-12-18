import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Loader2, Maximize2 } from 'lucide-react';
import { ChatMessage, ProcessingStatus } from '../types';

interface ChatFloatingWindowProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  status: ProcessingStatus;
}

export const ChatFloatingWindow: React.FC<ChatFloatingWindowProps> = ({
  isOpen,
  setIsOpen,
  messages,
  onSendMessage,
  status
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const isLoading = status === 'refining';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-900/30 transition-all hover:scale-110 active:scale-95"
        title="Open AI Assistant"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ease-in-out bg-[#1e1e2e] border border-gray-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col
        ${isMinimized 
          ? 'bottom-6 right-6 w-72 h-14' 
          : 'bottom-6 right-6 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]'
        }`}
    >
      {/* Header */}
      <div 
        className="h-14 bg-dark-900 border-b border-gray-800 flex items-center justify-between px-4 cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 text-white font-medium">
          <Bot size={18} className="text-brand-500" />
          <span>Code Assistant</span>
          {isLoading && <span className="text-xs text-brand-400 animate-pulse ml-2">Thinking...</span>}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e1e2e] custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 px-6">
                <Bot size={48} className="mb-3 opacity-20" />
                <p className="text-sm">I can help you tweak the code. Try asking:</p>
                <div className="mt-4 space-y-2 w-full">
                  <button onClick={() => setInput("Make the background darker")} className="block w-full text-xs bg-dark-900 border border-gray-700 p-2 rounded hover:border-brand-500/50 transition-colors text-left">"Make the background darker"</button>
                  <button onClick={() => setInput("Change the button color to red")} className="block w-full text-xs bg-dark-900 border border-gray-700 p-2 rounded hover:border-brand-500/50 transition-colors text-left">"Change the button color to red"</button>
                  <button onClick={() => setInput("Add a loading spinner")} className="block w-full text-xs bg-dark-900 border border-gray-700 p-2 rounded hover:border-brand-500/50 transition-colors text-left">"Add a loading spinner"</button>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-brand-600' : 'bg-dark-900 border border-gray-700'
                  }`}>
                    {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-brand-500" />}
                  </div>
                  
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-dark-900 border border-gray-700 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-dark-900 border border-gray-700 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-brand-500" />
                 </div>
                 <div className="bg-dark-900 border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-200"></div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-dark-900 border-t border-gray-800">
            <div className="relative flex items-end bg-[#1e1e2e] border border-gray-700 rounded-xl focus-within:border-brand-500/50 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe changes..."
                className="w-full bg-transparent text-white text-sm p-3 max-h-32 min-h-[44px] resize-none focus:outline-none custom-scrollbar"
                rows={1}
                style={{ height: 'auto', minHeight: '44px' }}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                }}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className={`p-2 m-1.5 rounded-lg shrink-0 transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-brand-600 text-white hover:bg-brand-500' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};