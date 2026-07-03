"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Search, Loader2, Send, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { 
  collection, query, orderBy, getDocs, 
  updateDoc, doc, arrayUnion, serverTimestamp 
} from "firebase/firestore";
import { toast } from "sonner";
import type { SupportTicket, TicketMessage } from "@/types";

export default function AdminSupportPage() {
  const { userProfile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // View/Reply state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "support_tickets"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      const fetched: SupportTicket[] = [];
      snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() } as SupportTicket));
      setTickets(fetched);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedTicket) return;
    
    try {
      const newMsg: TicketMessage = {
        id: Date.now().toString(),
        senderId: userProfile.uid,
        senderName: userProfile.name,
        senderRole: userProfile.role,
        message: replyMessage,
        createdAt: new Date(),
      };

      await updateDoc(doc(db, "support_tickets", selectedTicket.id), {
        messages: arrayUnion(newMsg),
        status: "in_progress",
        updatedAt: serverTimestamp()
      });

      toast.success("Reply sent!");
      setReplyMessage("");
      // Update local state
      const updatedTicket = {
        ...selectedTicket,
        status: "in_progress" as const,
        messages: [...selectedTicket.messages, newMsg],
      };
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reply");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, "support_tickets", id), {
        status: "resolved",
        updatedAt: serverTimestamp()
      });
      toast.success("Ticket marked as resolved");
      if (selectedTicket?.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, status: "resolved" } : null);
      }
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary-500" />
            Support Helpdesk
          </h1>
          <p className="text-muted-foreground mt-1">Manage and respond to student queries.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Ticket List */}
        <div className="w-full lg:w-1/3 flex flex-col card p-0 overflow-hidden shrink-0">
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3 bg-muted rounded-xl p-2 px-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="bg-transparent border-none focus:outline-none w-full text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground text-sm">No tickets found</div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm truncate pr-2">{ticket.subject}</h4>
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        ticket.status === 'open' ? 'bg-orange-500' : 
                        ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {ticket.messages[0]?.message}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>User ID: {ticket.userId.slice(0,6)}...</span>
                      <span>{new Date((ticket.createdAt as any)?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Chat View */}
        <div className="hidden lg:flex flex-1 card p-0 flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-bold text-lg">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Ticket #{selectedTicket.id.slice(0,8)}</span>
                    <span className={`badge uppercase text-[10px] bg-muted`}>{selectedTicket.priority} Priority</span>
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && (
                  <button onClick={() => handleResolve(selectedTicket.id)} className="btn-secondary text-sm py-1.5 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Mark Resolved
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {selectedTicket.messages.map((msg, i) => {
                  const isAdmin = msg.senderRole === "admin" || msg.senderRole === "super_admin";
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3 ${
                        isAdmin ? 'bg-primary-600 text-white rounded-br-none' : 'bg-muted rounded-bl-none'
                      }`}>
                        <div className="text-[10px] opacity-70 mb-1 font-medium flex justify-between gap-4">
                          <span>{msg.senderName} {isAdmin && '(Admin)'}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {selectedTicket.status !== 'resolved' ? (
                <div className="p-4 border-t border-border shrink-0 bg-background">
                  <form onSubmit={handleReply} className="flex gap-2">
                    <input 
                      required
                      type="text" 
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..." 
                      className="flex-1 bg-muted px-4 py-2 rounded-xl outline-none focus:ring-1 ring-primary-500 border border-transparent focus:border-primary-500"
                    />
                    <button type="submit" className="btn-primary shrink-0 w-10 h-10 rounded-xl p-0 flex items-center justify-center">
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 border-t border-border shrink-0 bg-muted/30 text-center text-sm text-muted-foreground">
                  This ticket is resolved and closed for new replies.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 opacity-20 mb-3" />
              <p>Select a ticket to view and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
