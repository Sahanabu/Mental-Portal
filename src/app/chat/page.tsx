'use client';

import { useState } from 'react';
import { ChatWindow, type Message } from '@/components/ChatWindow';
import { chatAPI } from '@/services/api';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hello. I am your mental wellness companion. How are you feeling right now?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: messageText 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(messageText);
      const botMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: response.data.reply || 'I am here to listen.' 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Mock fallback if backend is not running
      setTimeout(() => {
        const botMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: "I hear you. Whatever you're feeling is valid. Would you like to try a breathing exercise?" 
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1500);
    } finally {
      setTimeout(() => setIsTyping(false), 1500);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full p-4 pt-20">
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </div>
  );
}
