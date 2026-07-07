import re

with open('src/pages/ParentPortal.tsx', 'r') as f:
    content = f.read()

# Add setAnnouncement
if 'const [announcement, setAnnouncement] = useState<any>(null);' not in content:
    content = content.replace('const [children, setChildren] = useState<any[]>([]);', 'const [children, setChildren] = useState<any[]>([]);\n  const [announcement, setAnnouncement] = useState<any>(null);')

# Add fetch in useEffect
if 'fetchVisibleAnnouncements' in content and 'setAnnouncement' in content and 'anns[0]' not in content:
    pattern_fetch = r"if \(mappedChildren\.length > 0\) \{\s*setChildren\(mappedChildren\);\s*setActiveChild\(mappedChildren\[0\]\.user_id\);\s*\}"
    new_fetch = """if (mappedChildren.length > 0) {
            setChildren(mappedChildren);
            setActiveChild(mappedChildren[0].user_id);
         }
      }
      
      const anns = await fetchVisibleAnnouncements(u, localStorage.getItem('current_role') || u.role || 'parent', 1);
      if (anns && anns.length > 0) {
         setAnnouncement(anns[0]);
      }"""
    content = re.sub(pattern_fetch, new_fetch, content)
    
# Replace hardcoded announcement UI
pattern_ui = r"\{/\*\s*School Announcements\s*\*/\}.*?</button>\s*</div>"
new_ui = """{/* School Announcements */}
        {announcement && (
        <div className="md:col-span-12 bg-primary-container/10 rounded-3xl border border-primary-container/30 p-8 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shrink-0 border-2 border-primary-container z-10 shadow-sm">
              <Megaphone className="w-8 h-8 text-primary opacity-80" />
           </div>
           
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-label text-base text-on-surface font-bold">{announcement.title}</h3>
                 <span className="font-caption text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wide font-bold">New</span>
              </div>
              <p className="font-body text-on-surface-variant text-sm line-clamp-2">
                 {announcement.content ? (() => {
                    try {
                       const contentStr = atob(announcement.content).replace(/<[^>]+>/g, '');
                       return contentStr.replace(/\\$\\$_role:\\s*(.*?)\\s*(?:_\\$\\$|\\$\\$)\\s*/is, '');
                    } catch (e) {
                       return announcement.content.replace(/<[^>]+>/g, '').replace(/\\$\\$_role:\\s*(.*?)\\s*(?:_\\$\\$|\\$\\$)\\s*/is, '');
                    }
                 })() : ''}
              </p>
           </div>
           
           <a href="/parent/announcements" className="font-label text-sm text-primary font-bold hover:underline shrink-0 px-4">
              Read More
           </a>
        </div>
        )}"""
content = re.sub(pattern_ui, new_ui, content, flags=re.DOTALL)

with open('src/pages/ParentPortal.tsx', 'w') as f:
    f.write(content)
