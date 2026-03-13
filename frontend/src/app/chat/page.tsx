'use client';

import { useState, useEffect } from 'react';
import { ChatWindow, type Message } from '@/components/ChatWindow';
import { chatAPI, tokenManager } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hello. I am your mental wellness companion. How are you feeling right now?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = tokenManager.getToken();
    if (!token) {
      setMessages(prev => [...prev, {
        id: '2',
        sender: 'bot',
        text: 'To use the AI chat feature, please sign in or continue anonymously. I can still chat with you using fallback responses!'
      }]);
    }
    setIsAuthenticated(!!token);
  }, []);

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
        text: response.data.message || 'I am here to listen.' 
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    } catch (error: any) {
      console.log('Using fallback response:', error.response?.status);
      
      // Fallback responses based on keywords
      setTimeout(() => {
        let fallbackText = "I hear you. Whatever you're feeling is valid.";
        
        const lowerMessage = messageText.toLowerCase();
        if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
          fallbackText = "Stress and anxiety can be overwhelming. Would you like to try a breathing exercise? Visit the Breathe page for guided exercises.";
        } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
          fallbackText = "I'm sorry you're feeling this way. Remember, it's okay to not be okay. Consider talking to someone you trust or checking our Resources page.";
        } else if (lowerMessage.includes('happy') || lowerMessage.includes('good')) {
          fallbackText = "That's wonderful to hear! Keep nurturing those positive feelings. What's been making you feel good?";
        } else if (lowerMessage.includes('help')) {
          fallbackText = "I'm here to support you. You can explore our assessment, mood tracking, or breathing exercises. For professional help, check the Resources page.";
        }
        
        const botMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: fallbackText
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
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
