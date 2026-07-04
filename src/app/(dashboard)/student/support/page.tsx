"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Send, XCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { 
  collection, query, where, getDocs, 
  addDoc, updateDoc, doc, arrayUnion, serverTimestamp 
} from "firebase/firestore";
import { toast } from "sonner";
import type { SupportTicket, TicketMessage } from "@/types";

export default function StudentSupportPage() {
  const { userProfile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New ticket state
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("medium");
  const [initialMessage, setInitialMessage] = useState("");

  // Chat view state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    if (userProfile) fetchTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const fetchTickets = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "support_tickets"), 
        where("userId", "==", userProfile.uid)
      );
      const snapshot = await getDocs(q);
      const fetched: SupportTicket[] = [];
      snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() } as SupportTicket));
      
      // Sort in memory to avoid composite index
      fetched.sort((a, b) => {
        const timeA = (a.updatedAt as any)?.toMillis ? (a.updatedAt as any).toMillis() : (a.updatedAt as any)?.getTime?.() || 0;
        const timeB = (b.updatedAt as any)?.toMillis ? (b.updatedAt as any).toMillis() : (b.updatedAt as any)?.getTime?.() || 0;
        return timeB - timeA;
      });
      
      setTickets(fetched);

      // Keep selected ticket in sync
      if (selectedTicket) {
        const updatedSelected = fetched.find(t => t.id === selectedTicket.id);
        if (updatedSelected) setSelectedTicket(updatedSelected);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    
    try {
      const newMsg: TicketMessage = {
        id: Date.now().toString(),
        senderId: userProfile.uid,
        senderName: userProfile.name,
        senderRole: userProfile.role,
        message: initialMessage,
        createdAt: new Date(),
      };

      const newTicket: Omit<SupportTicket, "id"> = {
        userId: userProfile.uid,
        subject,
        priority,
        status: "open",
        messages: [newMsg],
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      const docRef = await addDoc(collection(db, "support_tickets"), newTicket);
      toast.success("Ticket created successfully!");
      setIsModalOpen(false);
      setSubject("");
      setInitialMessage("");
      fetchTickets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create ticket");
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
        status: "open", // Reopen/Set active when student replies
        updatedAt: serverTimestamp()
      });

      toast.success("Reply sent!");
      setReplyMessage("");
      fetchTickets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reply");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="w-4 h-4 text-orange-500" />;
      case "in_progress": return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "resolved": 
      case "closed": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary-500" />
            Support Center
          </h1>
          <p className="text-muted-foreground mt-1">Need help? We&apos;re here for you.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-5 h-5 animate-pulse" />
          New Ticket
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Ticket List */}
        <div className="w-full lg:w-1/3 flex flex-col card p-0 overflow-hidden shrink-0">
          <div className="p-4 border-b border-border shrink-0 bg-muted/20">
            <h3 className="font-bold text-sm">Your Tickets</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
            ) : tickets.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground text-sm">No tickets found</div>
            ) : (
              <div className="divide-y divide-border">
                {tickets.map(ticket => (
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
                      {ticket.messages[ticket.messages.length - 1]?.message}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span className="badge text-[8px] uppercase">{ticket.priority}</span>
                      <span>{ticket.updatedAt ? new Date((ticket.updatedAt as any).seconds * 1000).toLocaleDateString() : "Just now"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Thread View */}
        <div className="hidden lg:flex flex-1 card p-0 flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-bold text-lg">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Ticket #{selectedTicket.id.slice(0,8)}</span>
                    <span className="badge uppercase text-[10px] flex items-center gap-1">
                      {getStatusIcon(selectedTicket.status)} {selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {selectedTicket.messages.map((msg, i) => {
                  const isAdmin = msg.senderRole === "admin" || msg.senderRole === "super_admin";
                  return (
                    <div key={i} className={`flex ${!isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3 ${
                        !isAdmin ? 'bg-primary-600 text-white rounded-br-none' : 'bg-muted rounded-bl-none'
                      }`}>
                        <div className="text-[10px] opacity-70 mb-1 font-medium">
                          {msg.senderName} {isAdmin && '(Support Staff)'}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Reply Area */}
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
                  This ticket has been resolved and closed.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 opacity-20 mb-3" />
              <p>Select a ticket to open conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl">Create Support Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input required value={subject} onChange={e => setSubject(e.target.value)} type="text" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none" placeholder="e.g. Payment Issue" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <textarea required value={initialMessage} onChange={e => setInitialMessage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none min-h-[120px]" placeholder="Describe your issue in detail..." />
              </div>
              <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                <Send className="w-4 h-4" /> Submit Ticket
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
