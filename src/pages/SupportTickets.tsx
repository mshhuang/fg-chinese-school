import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ticket, Loader2, AlertCircle, Calendar, Image as ImageIcon, CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function SupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .eq('type', 'support_ticket')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ type: 'support_ticket_resolved' }) // Mark as resolved by changing type, or we could add a field to details, but changing type is easiest with current schema
        .eq('id', id);

      if (error) throw error;
      setTickets(tickets.filter(t => t.id !== id));
      if (selectedTicket?.id === id) setSelectedTicket(null);
    } catch (err) {
      console.error('Error resolving ticket:', err);
      alert('Failed to resolve ticket.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">Support Tickets</h1>
          <p className="text-on-surface-variant mt-2">View and manage issues reported by users.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Ticket List */}
        <div className="w-1/3 bg-surface-container rounded-3xl border border-outline-variant/30 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-high font-label font-bold text-on-surface flex justify-between items-center">
            <span>Open Tickets ({tickets.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 mb-4 text-primary/50" />
                <p>No open support tickets.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-colors border",
                    selectedTicket?.id === ticket.id
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-surface hover:bg-surface-variant/50 border-outline-variant/30 text-on-surface"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-bold font-label truncate pr-2">{ticket.message.replace('Feedback/Issue Report from ', '')}</span>
                    <span className="text-xs font-mono opacity-70 whitespace-nowrap">
                      {format(new Date(ticket.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 opacity-80 mb-2">
                    {ticket.details?.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-label opacity-70">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.path}
                    </span>
                    {ticket.details?.screenshot && (
                      <span className="flex items-center gap-1 text-primary">
                        <ImageIcon className="w-3 h-3" /> Screenshot
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="w-2/3 bg-surface-container rounded-3xl border border-outline-variant/30 flex flex-col overflow-hidden shadow-sm">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-outline-variant/30 bg-surface-container-high flex justify-between items-start flex-shrink-0">
                <div>
                  <h2 className="text-xl font-display font-bold text-on-surface mb-1">
                    {selectedTicket.message}
                  </h2>
                  <div className="flex items-center gap-4 text-sm font-label text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(selectedTicket.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    <span>Path: <code className="bg-surface-variant px-1 rounded">{selectedTicket.path}</code></span>
                  </div>
                </div>
                <button
                  onClick={() => handleResolve(selectedTicket.id)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Resolve Ticket
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-sm font-label font-bold text-on-surface-variant mb-3 uppercase tracking-wider">Description</h3>
                  <div className="bg-surface p-4 rounded-2xl border border-outline-variant/30 text-on-surface whitespace-pre-wrap font-body">
                    {selectedTicket.details?.description || 'No description provided.'}
                  </div>
                </div>

                {selectedTicket.details?.screenshot && (
                  <div>
                    <h3 className="text-sm font-label font-bold text-on-surface-variant mb-3 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Attached Screenshot
                    </h3>
                    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-2 overflow-hidden flex justify-center">
                      <img 
                        src={selectedTicket.details.screenshot} 
                        alt="Issue Screenshot" 
                        className="max-w-full rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8">
              <Ticket className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-display text-lg">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
