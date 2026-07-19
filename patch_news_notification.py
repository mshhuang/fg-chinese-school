import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

target = """       // Newsletters
       if (['admin', 'builder', 'teacher'].includes(userRole || '')) {
           const { data: newsData } = await supabase
             .from('newsletters')
             .select('newsletter_id')
             .eq('status', 'Published');

           if (newsData) {
             const stored = localStorage.getItem(`news_read_${currentUserId}`);
             const readState = stored ? JSON.parse(stored) : {};
             let newsUnread = 0;
             newsData.forEach((news: any) => {
               if (!readState[news.newsletter_id]) {
                 newsUnread++;
               }
             });
             setUnreadNewslettersCount(newsUnread);
           }
       } else {
           setUnreadNewslettersCount(0);
       }"""

replacement = """       // Newsletters
       if (['admin', 'builder', 'teacher'].includes(userRole || '')) {
           let query = supabase
             .from('newsletters')
             .select('newsletter_id, status');
           
           if (['admin', 'builder'].includes(userRole || '')) {
               query = query.in('status', ['Published', 'Pending Approval']);
           } else {
               query = query.eq('status', 'Published');
           }

           const { data: newsData } = await query;

           if (newsData) {
             const stored = localStorage.getItem(`news_read_${currentUserId}`);
             const readState = stored ? JSON.parse(stored) : {};
             let newsUnread = 0;
             newsData.forEach((news: any) => {
               // For admins/builders, 'Pending Approval' always counts as unread if they haven't explicitly marked it read (or just count all Pending Approval)
               if (['admin', 'builder'].includes(userRole || '') && news.status === 'Pending Approval') {
                 // You can either force them to be unread, or still use the readState.
                 // Let's use readState so it disappears once they view it, or maybe just always show if pending.
                 // Let's just always show if pending so they know there is pending work.
                 newsUnread++;
               } else if (!readState[news.newsletter_id]) {
                 newsUnread++;
               }
             });
             setUnreadNewslettersCount(newsUnread);
           }
       } else {
           setUnreadNewslettersCount(0);
       }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/layout/MainLayout.tsx', 'w') as f:
        f.write(content)
    print("Patched MainLayout.tsx")
else:
    print("Target not found!")
