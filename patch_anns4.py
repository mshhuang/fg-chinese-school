import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

bad_logic = """      setAnnouncements(finalAnns || []);
      
      if (finalAnns && finalAnns.length > 0) {
          const ids = finalAnns.map(a => a.announcement_id);
          const { data: rcData } = await supabase.from('read_receipts').select('item_id').eq('item_type', 'announcement').in('item_id', ids);
          if (rcData) {
              const counts = {};
              rcData.forEach(r => {
                  counts[r.item_id] = (counts[r.item_id] || 0) + 1;
              });
              setReadCounts(counts);
          }
      }
    } catch(err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }"""

good_logic = """      setAnnouncements(finalAnns || []);
      setLoading(false);
      
      if (finalAnns && finalAnns.length > 0) {
          const ids = finalAnns.map(a => a.announcement_id);
          supabase.from('read_receipts').select('item_id').eq('item_type', 'announcement').in('item_id', ids).then(({data: rcData}) => {
              if (rcData) {
                  const counts: any = {};
                  rcData.forEach((r: any) => {
                      counts[r.item_id] = (counts[r.item_id] || 0) + 1;
                  });
                  setReadCounts(counts);
              }
          });
      }
    } catch(err) {
      console.error('Error fetching announcements:', err);
      setLoading(false);
    }"""

if bad_logic in content:
    content = content.replace(bad_logic, good_logic)
    with open('src/pages/Announcements.tsx', 'w') as f:
        f.write(content)
    print("Replaced!")
else:
    print("Could not find!")
