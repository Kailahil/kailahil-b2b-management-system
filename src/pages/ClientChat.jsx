import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';

export default function ClientChat() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const clientBusinessList = await base44.entities.ClientBusiness.filter({ 
          user_id: currentUser.id 
        });

        if (clientBusinessList.length > 0) {
          const businessList = await base44.entities.Business.filter({ 
            id: clientBusinessList[0].business_id 
          });
          if (businessList.length > 0) {
            setBusiness(businessList[0]);
            // TODO: Load chat messages when entity is created
          }
        }
      } catch (error) {
        console.error('Failed to load chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !business) return;

    setSending(true);
    try {
      // TODO: Save message to database when entity is created
      // For now, add it to local state
      setMessages([...messages, {
        id: Date.now(),
        text: messageText,
        sender: user.full_name,
        timestamp: new Date().toISOString(),
        isFromClient: true
      }]);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 flex flex-col h-[calc(100vh-120px)]">
        <div className="mb-6">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Messages</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            Chat with Your Team
          </h1>
          <p className="text-[#6b7055] text-lg">
            {business?.name ? `Direct messaging with ${business.name}'s media specialists` : 'Your messages will appear here'}
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-[#d4d2c8] mb-6" />
              <h3 className="text-2xl font-bold text-[#2d3319] mb-3">Start a Conversation</h3>
              <p className="text-[#6b7055] text-lg max-w-md">
                Send a message to your media specialist team. They'll respond during business hours.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-[#e8e6de]/50 overflow-y-auto mb-4">
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isFromClient ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2 ${
                    msg.isFromClient 
                      ? 'bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] text-white'
                      : 'bg-[#f9f8f4] text-[#2d3319] border border-[#e8e6de]'
                  }`}>
                    <p className="font-semibold text-xs mb-1">{msg.sender}</p>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#e8e6de]/50 flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-[#e8e6de] focus:border-[#a8b88c]"
            disabled={!business}
          />
          <Button
            type="submit"
            disabled={sending || !messageText.trim() || !business}
            className="bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] hover:from-[#6d7d51] hover:to-[#5f6f43] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}