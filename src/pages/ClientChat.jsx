import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Users } from 'lucide-react';

export default function ClientChat() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const clientAuthStr = localStorage.getItem('clientAuth');
        const currentUser = clientAuthStr ? JSON.parse(clientAuthStr) : await base44.auth.me();
        setUser(currentUser);

        const clientBusinessList = await base44.asServiceRole.entities.ClientBusiness.filter({ 
          user_id: currentUser.id 
        });

        if (clientBusinessList.length > 0) {
          const businessList = await base44.asServiceRole.entities.Business.filter({ 
            id: clientBusinessList[0].business_id 
          });
          if (businessList.length > 0) {
            const selectedBusiness = businessList[0];
            setBusiness(selectedBusiness);
            
            // Load all employees who have access to this business
            const accessList = await base44.asServiceRole.entities.BusinessAccess.filter({
              business_id: selectedBusiness.id
            });
            
            if (accessList.length > 0) {
              const userIds = accessList.map(a => a.user_id);
              const userList = await base44.asServiceRole.entities.User.filter({
                id: { $in: userIds }
              });
              setEmployees(userList);
              if (userList.length > 0) {
                setSelectedEmployeeId(userList[0].id);
                
                // Load messages with the first employee
                const msgs = await base44.asServiceRole.entities.Message.filter({
                  business_id: selectedBusiness.id,
                  sender_id: currentUser.id,
                  recipient_id: userList[0].id
                }, '-created_date', 50);
                setMessages(msgs.map(m => ({
                  id: m.id,
                  text: m.text,
                  sender: m.sender_name,
                  timestamp: m.created_date,
                  isFromClient: m.sender_type === 'client'
                })).reverse());
              }
            }
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
    if (!messageText.trim() || !selectedEmployeeId) return;

    setSending(true);
    try {
      const newMessage = await base44.asServiceRole.entities.Message.create({
        business_id: business.id,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_type: 'client',
        recipient_id: selectedEmployeeId,
        text: messageText
      });

      setMessages([...messages, {
        id: newMessage.id,
        text: newMessage.text,
        sender: newMessage.sender_name,
        timestamp: newMessage.created_date,
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
            {business?.name ? `Direct messaging with ${business.name}'s team` : 'Your messages will appear here'}
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto text-[#d4d2c8] mb-6" />
              <h3 className="text-2xl font-bold text-[#2d3319] mb-3">No team members yet</h3>
              <p className="text-[#6b7055] text-lg max-w-md">
                Your agency team will appear here once they're assigned to your business.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
           <div className="flex-1 flex items-center justify-center">
             <div className="text-center">
               <MessageCircle className="w-16 h-16 mx-auto text-[#d4d2c8] mb-6" />
               <h3 className="text-2xl font-bold text-[#2d3319] mb-3">Start a Conversation</h3>
               <p className="text-[#6b7055] text-lg max-w-md">
                 Send a message to your {selectedEmployeeId ? 'team member' : 'team'}. They'll respond during business hours.
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

        {employees.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#e8e6de]/50 mb-4">
            <label className="text-sm font-medium text-[#2d3319] block mb-2">Send to:</label>
            <select 
              value={selectedEmployeeId || ''}
              onChange={async (e) => {
                setSelectedEmployeeId(e.target.value);
                const msgs = await base44.asServiceRole.entities.Message.filter({
                  business_id: business.id,
                  sender_id: user.id,
                  recipient_id: e.target.value
                }, '-created_date', 50);
                setMessages(msgs.map(m => ({
                  id: m.id,
                  text: m.text,
                  sender: m.sender_name,
                  timestamp: m.created_date,
                  isFromClient: m.sender_type === 'client'
                })).reverse());
              }}
              className="w-full border border-[#e8e6de] rounded-lg px-3 py-2 text-sm focus:border-[#a8b88c] focus:ring-1 focus:ring-[#a8b88c]"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#e8e6de]/50 flex gap-2">
           <Input
             value={messageText}
             onChange={(e) => setMessageText(e.target.value)}
             placeholder="Type your message..."
             className="flex-1 border-[#e8e6de] focus:border-[#a8b88c]"
             disabled={!selectedEmployeeId}
           />
           <Button
             type="submit"
             disabled={sending || !messageText.trim() || !selectedEmployeeId}
             className="bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] hover:from-[#6d7d51] hover:to-[#5f6f43] text-white"
           >
             <Send className="w-4 h-4" />
           </Button>
         </form>
      </div>
    </div>
  );
}