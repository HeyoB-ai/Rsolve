
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';
import { geminiService } from '../services/geminiService';

const CaseDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm reaching out regarding the repair costs we discussed.", isOwn: false, sender: "Alex Smith", timestamp: "10:15 AM" },
    { id: '2', text: "Hey Alex. I have reviewed the estimates. It seems a bit high for a minor scrape.", isOwn: true, sender: "Jordan", timestamp: "10:18 AM" },
    { id: '3', text: "I understand. I can share the invoice from the shop if that helps clarify?", isOwn: false, sender: "Alex Smith", timestamp: "10:20 AM" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isOwn: true,
      sender: "Jordan",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const getAIAssistance = async () => {
    const context = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const help = await geminiService.getMediatorSuggestion(context);
    setSuggestion(help);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-slate-100 rounded-full">
            <svg className="w-6 h-6 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Property Damage - Unit 4B</h1>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Negotiation</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/cases/${id}/proposals`)}>
          Proposals
        </Button>
      </header>

      {/* Suggestion Bar */}
      {suggestion && (
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-start animate-slide-down">
          <div className="flex gap-2">
            <div className="mt-1"><svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></div>
            <p className="text-xs text-blue-800 font-medium italic leading-relaxed">"{suggestion}"</p>
          </div>
          <button onClick={() => setSuggestion(null)}><ICONS.X className="w-4 h-4 text-blue-400" /></button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        {messages.map((m) => (
          <ChatBubble 
            key={m.id} 
            text={m.text} 
            isOwn={m.isOwn} 
            sender={m.sender} 
            timestamp={m.timestamp} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={getAIAssistance}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider"
          >
             Mediator Helper
          </button>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <Button size="icon" className="rounded-[12px] shrink-0" onClick={handleSendMessage}>
            <svg className="w-5 h-5 -rotate-45 -mr-1 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
