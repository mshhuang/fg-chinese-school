import re

with open('src/pages/ParentPortal.tsx', 'r') as f:
    content = f.read()

# Update state type
content = content.replace(
    "const [checkInStatus, setCheckInStatus] = useState<'checked_in' | 'not_checked_in' | 'loading'>('loading');",
    "const [checkInStatus, setCheckInStatus] = useState<'checked_in' | 'checked_out' | 'not_checked_in' | 'loading'>('loading');"
)

# Update fetch logic
fetch_logic = """     if (data && data.length > 0) {
        if (data[0].action_type === 'school_check_in') {
            setCheckInStatus('checked_in');
        } else if (data[0].action_type === 'school_check_out') {
            setCheckInStatus('checked_out');
        } else {
            setCheckInStatus('not_checked_in');
        }
     } else {
        setCheckInStatus('not_checked_in');
     }"""
content = re.sub(
    r'if \(data && data\.length > 0\) \{.*?else \{\s*setCheckInStatus\(\'not_checked_in\'\);\s*\}',
    fetch_logic,
    content,
    flags=re.DOTALL
)

# Update UI render
ui_render = """<span className={`font-caption text-sm px-4 py-1.5 rounded-full flex items-center gap-2 border font-bold ${checkInStatus === 'checked_in' ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30' : checkInStatus === 'checked_out' ? 'bg-[#EFEBE9] text-[#5D4037] border-[#5D4037]/30' : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'}`}>
                    <CheckCircle2 className="w-4 h-4" /> {checkInStatus === 'loading' ? 'Loading...' : checkInStatus === 'checked_in' ? `${activeChildInfo?.first_name || 'Student'} is in the school` : checkInStatus === 'checked_out' ? `${activeChildInfo?.first_name || 'Student'} is ready to go home` : 'Not Checked In'}
                 </span>"""
content = re.sub(
    r'<span className=\{`font-caption text-sm px-4 py-1\.5 rounded-full flex items-center gap-2 border font-bold \$\{checkInStatus === \'checked_in\' \? \'bg-tertiary-container/20 text-tertiary border-tertiary/20\' : \'bg-surface-variant text-on-surface-variant border-outline-variant/30\'\}`\}>\s*<CheckCircle2 className="w-4 h-4" /> \{checkInStatus === \'loading\' \? \'Loading\.\.\.\' : checkInStatus === \'checked_in\' \? \'Checked In\' : \'Not Checked In\'\}\s*</span>',
    ui_render,
    content,
    flags=re.DOTALL
)

with open('src/pages/ParentPortal.tsx', 'w') as f:
    f.write(content)
