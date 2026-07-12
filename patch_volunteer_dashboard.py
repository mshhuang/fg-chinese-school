import re

with open('src/pages/VolunteerDashboard.tsx', 'r') as f:
    content = f.read()

# Add clockStatus state
state_code = """  const [showQrCode, setShowQrCode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [clockStatus, setClockStatus] = useState<'clocked_in' | 'clocked_out' | 'loading'>('loading');
"""
content = re.sub(r'  const \[showQrCode, setShowQrCode\] = useState\(false\);\n  const \[user, setUser\] = useState<any>\(null\);', state_code, content)

# Add fetch function and handle functions
fetch_code = """
  const fetchClockStatus = async (currentUser: any) => {
    if (!currentUser || currentUser.id === 'demo') {
       setClockStatus('clocked_out');
       return;
    }
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const { data } = await supabase
       .from('staff_clock_ins')
       .select('*')
       .eq('user_id', currentUser.id)
       .gte('created_at', startOfDay.toISOString())
       .order('created_at', { ascending: false })
       .limit(1);
       
    if (data && data.length > 0) {
       setClockStatus(data[0].action_type === 'clock_in' ? 'clocked_in' : 'clocked_out');
    } else {
       setClockStatus('clocked_out');
    }
  };

  const handleClockInOut = async () => {
    if (!user || (user?.user_id || user?.id) === 'demo') return;
    const newStatus = clockStatus === 'clocked_in' ? 'clocked_out' : 'clocked_in';
    setClockStatus('loading');
    
    const { error } = await supabase.from('staff_clock_ins').insert({
       user_id: (user?.user_id || user?.id),
       action_type: newStatus === 'clocked_in' ? 'clock_in' : 'clock_out',
       daily_status: newStatus === 'clocked_in' ? 'check-in the building' : 'shifts over'
    });
    if (error) console.error("Error clocking in:", error);
    setClockStatus(newStatus);
  };
"""

content = re.sub(r'  const nextMonth = \(\) => {', fetch_code + '\n  const nextMonth = () => {', content)

# Add fetchClockStatus call inside fetchAnnouncements (where setUser happens)
call_code = """
        userId = (u.user_id || u.id);
        setUser(u);
        userRoles = u.role_names || [];
        fetchClockStatus(u);
"""
content = content.replace("""        userId = (u.user_id || u.id);
        setUser(u);
        userRoles = u.role_names || [];""", call_code)

# Add Button
button_code = """        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button 
                onClick={handleClockInOut}
                disabled={clockStatus === 'loading'}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full font-label font-bold transition-colors shadow-sm disabled:opacity-50 ${
                    clockStatus === 'clocked_in'
                        ? 'bg-error-container text-on-error-container hover:bg-error-container/90 border border-error/20'
                        : 'bg-primary text-on-primary hover:bg-primary/90'
                }`}
            >
               <Clock className="w-5 h-5 fill-current opacity-80" />
               {clockStatus === 'loading' ? 'Loading...' : clockStatus === 'clocked_in' ? 'Clock Out' : 'Clock In'}
            </button>
            <button onClick={() => setShowQrCode(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-label font-bold transition-colors shadow-sm bg-primary-container text-on-primary-container hover:bg-primary-container/80">"""
            
content = content.replace("""        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button onClick={() => setShowQrCode(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-label font-bold transition-colors shadow-sm bg-primary-container text-on-primary-container hover:bg-primary-container/80">""", button_code)

with open('src/pages/VolunteerDashboard.tsx', 'w') as f:
    f.write(content)

