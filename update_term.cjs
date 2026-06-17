const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

content = content.replace(
    '<label className="font-label text-sm font-bold text-on-surface-variant">Term</label>',
    '<label className="font-label text-sm font-bold text-on-surface-variant">Notes</label>'
);

content = content.replace(
    '<input type="text" required value={enrollmentDetails.term} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, term: e.target.value})} placeholder="e.g. Fall 2026" className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />',
    '<input type="text" value={enrollmentDetails.notes} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, notes: e.target.value})} placeholder="e.g. Additional info" className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />'
);

content = content.replace(
    '<th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Program & Term</th>',
    '<th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Program & Notes</th>'
);

content = content.replace(
    '<span className="font-body text-xs flex items-center gap-1 text-on-surface-variant"><CalendarIcon className="w-3 h-3"/> {enr.term || \'N/A\'}</span>',
    '{enr.notes && <span className="font-body text-xs flex items-center gap-1 text-on-surface-variant"><CalendarIcon className="w-3 h-3"/> {enr.notes}</span>}'
);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
