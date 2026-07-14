import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Loader2, Calendar, Search, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function BuilderInternalMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('internal_messages')
        .select('*, sender:users!internal_messages_sender_id_fkey(first_name, last_name, email), recipient:users!internal_messages_recipient_id_fkey(first_name, last_name, email)')
        .order('sent_at', { ascending: false })
        .limit(200);

      if (fetchError) {
        throw fetchError;
      }
      
      setMessages(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (messageId: string, currentReadAt: string | null) => {
    try {
      const newReadAt = currentReadAt ? null : new Date().toISOString();
      const { error: updateError } = await supabase
        .from('internal_messages')
        .update({ read_at: newReadAt })
        .eq('message_id', messageId);
      if (updateError) throw updateError;
      setMessages(messages.map(m => m.message_id === messageId ? { ...m, read_at: newReadAt } : m));
    } catch (err: any) {
      alert("Error updating message: " + err.message);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('internal_messages')
        .delete()
        .eq('message_id', messageId);
      if (deleteError) throw deleteError;
      setMessages(messages.filter(m => m.message_id !== messageId));
    } catch (err: any) {
      console.error("Error deleting message:", err);
      // Fallback alert if it works
    }
  };

  const formatName = (user: any) => {
    if (!user) return "Unknown";
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || "Unknown";
  };

  const filteredMessages = messages.filter(m => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    const senderName = formatName(m.sender).toLowerCase();
    const recipientName = formatName(m.recipient).toLowerCase();
    const body = (m.body || "").toLowerCase();
    return senderName.includes(s) || recipientName.includes(s) || body.includes(s);
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/builder/dashboard')}
              className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">Internal Messages Monitor</h1>
              <p className="font-body text-on-surface-variant">View all system-wide internal messages.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-full text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button onClick={fetchMessages} className="text-sm font-medium text-primary hover:underline whitespace-nowrap">
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
            Error: {error}
          </div>
        )}

        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                  <th className="py-4 px-6 font-label font-bold text-on-surface-variant">Date</th>
                  <th className="py-4 px-6 font-label font-bold text-on-surface-variant">Sender</th>
                  <th className="py-4 px-6 font-label font-bold text-on-surface-variant">Recipient</th>
                  <th className="py-4 px-6 font-label font-bold text-on-surface-variant">Message</th>
                  <th className="py-4 px-6 font-label font-bold text-on-surface-variant">Status</th>
                  <th className="py-4 px-6 font-label font-bold text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-3 text-on-surface-variant">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="font-medium">Loading messages...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant font-medium">
                      No messages found.
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((msg) => (
                    <tr key={msg.message_id} className="hover:bg-surface-variant/10 transition-colors">
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant whitespace-nowrap">
                          <Calendar className="w-4 h-4" />
                          {new Date(msg.sent_at).toLocaleString([], { year: '2-digit', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className="font-medium text-sm text-on-surface">
                          {formatName(msg.sender)}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className="font-medium text-sm text-on-surface">
                          {formatName(msg.recipient)}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <div className="text-sm text-on-surface max-w-md break-words whitespace-pre-wrap">
                          {msg.body}
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top">
                        {msg.read_at ? (
                          <span className="inline-flex px-2 py-1 bg-primary-container text-on-primary-container rounded font-label text-xs font-bold">
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-surface-variant text-on-surface-variant rounded font-label text-xs font-bold">
                            Unread
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRead(msg.message_id, msg.read_at)}
                            className="px-3 py-1.5 rounded-full font-label text-xs font-bold bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 transition-colors"
                          >
                            {msg.read_at ? "Mark Unread" : "Mark Read"}
                          </button>
                          <button
                            onClick={() => handleDelete(msg.message_id)}
                            className="p-1.5 rounded-full text-error hover:bg-error/10 transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
