"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Send, XCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { 
  collection, query, where, orderBy, getDocs, 
  addDoc, serverTimestamp 
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
        where("userId", "==", userProfile.uid),
        orderBy("updatedAt", "desc")
      );
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

      await addDoc(collection(db, "support_tickets"), newTicket);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary-500" />
            Support Center
          </h1>
          <p className="text-muted-foreground mt-1">Need help? We&apos;re here for you.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.length === 0 ? (
            <div className="card text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>You have no open support tickets.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card hover:border-primary-500/50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{ticket.subject}</h3>
                  <div className="flex gap-2">
                    <span className={`badge uppercase text-[10px] ${ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
                      {ticket.priority}
                    </span>
                    <span className="badge uppercase text-[10px] flex items-center gap-1">
                      {getStatusIcon(ticket.status)} {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ticket.messages[0]?.message}
                </p>
                <div className="text-xs text-muted-foreground mt-4">
                  Last updated: {ticket.updatedAt ? new Date((ticket.updatedAt as any).seconds * 1000).toLocaleDateString() : "Just now"}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

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
