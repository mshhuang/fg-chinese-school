import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchVisibleAnnouncements } from "../lib/announcementUtils";
import { supabase } from "../lib/supabase";
import { MessageSquare, Megaphone, Newspaper, X } from "lucide-react";
import { cn } from "../lib/utils";

export function DashboardNotifications() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [unreadNewsletters, setUnreadNewsletters] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserId(u.id);
        setUserRole(localStorage.getItem('current_role') || u.role || '');
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      // 1. Messages
      const { count: msgCount } = await supabase
        .from('internal_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .is('read_at', null);

      setUnreadMessages(msgCount || 0);

      // 2. Announcements
      const annData = await fetchVisibleAnnouncements({ id: userId }, userRole || '', 100);

      if (annData) {
        const stored = localStorage.getItem(`ann_read_${userId}`);
        const readState = stored ? JSON.parse(stored) : {};
        let annUnread = 0;
        annData.forEach(ann => {
          if (!readState[ann.announcement_id]) {
            annUnread++;
          }
        });
        setUnreadAnnouncements(annUnread);
      }

      // 3. Newsletters (Only for roles that process them)
      if (['admin', 'builder', 'teacher'].includes(userRole)) {
          const { data: newsData } = await supabase
            .from('newsletters')
            .select('*')
            .eq('status', 'Published');

          if (newsData) {
            const stored = localStorage.getItem(`news_read_${userId}`);
            const readState = stored ? JSON.parse(stored) : {};
            let newsUnread = 0;
            newsData.forEach(news => {
              if (!readState[news.newsletter_id]) {
                newsUnread++;
              }
            });
            setUnreadNewsletters(newsUnread);
          }
      } else {
          setUnreadNewsletters(0);
      }
    };

    let debounceTimer: any;
    const debouncedFetchNotifications = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchNotifications();
        }, 1000);
    };

    fetchNotifications();

    const channel = supabase
      .channel('public:internal_messages_dash_' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_messages', filter: `recipient_id=eq.${userId}` }, () => {
         debouncedFetchNotifications();
      })
      .subscribe();

    window.addEventListener("ann_read_updated", fetchNotifications);
    window.addEventListener("news_read_updated", fetchNotifications);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
      window.removeEventListener("ann_read_updated", fetchNotifications);
      window.removeEventListener("news_read_updated", fetchNotifications);
    };
  }, [userId, userRole]);

  const handleDismiss = (type: string) => {
    setDismissed(prev => [...prev, type]);
  };

  const NotificationBanner = ({ type, count, icon: Icon, title, onClick }: any) => {
    if (count === 0 || dismissed.includes(type)) return null;

    return (
      <div 
        className={cn(
          "flex items-center justify-between p-4 mb-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all animate-in fade-in slide-in-from-top-4",
          type === 'messages' ? "bg-primary-container/20 border-primary/20" : "",
          type === 'announcements' ? "bg-secondary-container/20 border-secondary/20" : "",
          type === 'newsletters' ? "bg-tertiary-container/20 border-tertiary/20" : ""
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-full flex items-center justify-center",
            type === 'messages' ? "bg-primary text-on-primary" : "",
            type === 'announcements' ? "bg-secondary text-on-secondary" : "",
            type === 'newsletters' ? "bg-tertiary text-on-tertiary" : ""
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-label font-bold text-on-surface">You have {count} unread {count === 1 ? title.slice(0, -1) : title}</h4>
            <p className="font-caption text-sm text-on-surface-variant">Click to view your {title.toLowerCase()}.</p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleDismiss(type); }}
          className="p-2 hover:bg-surface-variant/30 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>
    );
  };

  const getRolePrefix = () => {
    if (userRole === 'admin' || userRole === 'builder') return '/admin';
    if (userRole === 'teacher') return '/teacher';
    if (userRole === 'student') return '/student';
    if (userRole === 'parent') return '/parent';
    if (userRole === 'staff') return '/staff';
    if (userRole === 'volunteer') return '/volunteer';
    return '';
  };

  const rolePrefix = getRolePrefix();

  return (
    <div className="w-full flex flex-col">
      <NotificationBanner 
        type="messages" 
        count={unreadMessages} 
        icon={MessageSquare} 
        title="Messages" 
        onClick={() => navigate(`${rolePrefix}/messages`)}
      />
      <NotificationBanner 
        type="announcements" 
        count={unreadAnnouncements} 
        icon={Megaphone} 
        title="Announcements" 
        onClick={() => navigate(`${rolePrefix}/announcements`)}
      />
      <NotificationBanner 
        type="newsletters" 
        count={unreadNewsletters} 
        icon={Newspaper} 
        title="Newsletters" 
        onClick={() => navigate(`${rolePrefix}/newsletters`)}
      />
    </div>
  );
}
