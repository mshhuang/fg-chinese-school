const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

const searchHeaders = `                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Student</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Program & Notes</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Class</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Status</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Dates</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
                  </tr>`;

const newHeaders = `                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Student</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Program</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Class</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Enrollment Date</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Drop Date</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Status</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Notes</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
                  </tr>`;

content = content.replace(searchHeaders, newHeaders);

content = content.replace(
  `<tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr>`,
  `<tr><td colSpan={8} className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr>`
);

content = content.replace(
  `<tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-body">No enrollments found.</td></tr>`,
  `<tr><td colSpan={8} className="p-8 text-center text-on-surface-variant font-body">No enrollments found.</td></tr>`
);

const searchBody = `                         <td className="p-4">
                            <div className="font-label font-bold text-on-surface">{student?.first_name} {student?.last_name}</div>
                         </td>
                         <td className="p-4">
                            <div className="flex flex-col gap-1">
                               <span className="font-title font-medium text-sm text-on-surface">{enr.program || 'N/A'}</span>
                               {enr.notes && <span className="font-body text-xs flex items-center gap-1 text-on-surface-variant"><CalendarIcon className="w-3 h-3"/> {enr.notes}</span>}
                            </div>
                         </td>
                         <td className="p-4">
                            <span className="font-body text-sm text-on-surface-variant">{classInfo?.class_name || 'Unassigned'}</span>
                         </td>
                         <td className="p-4">
                            <span className={\`px-2 py-0.5 rounded-full text-xs font-bold \${
                              enr.status === 'Active' ? 'bg-primary-container/30 text-primary' : 
                              enr.status === 'Dropped' ? 'bg-error-container/30 text-error' : 
                              enr.status === 'Completed' ? 'bg-tertiary-container/30 text-tertiary' : 
                              'bg-surface-variant text-on-surface-variant'
                            }\`}>
                               {enr.status || 'Active'}
                            </span>
                         </td>
                         <td className="p-4">
                            <div className="flex flex-col gap-1">
                               <span className="font-body text-xs text-on-surface-variant">Enrolled: {enr.enrollment_date || 'N/A'}</span>
                               {enr.drop_date && <span className="font-body text-xs text-error">Dropped: {enr.drop_date}</span>}
                            </div>
                         </td>
                         <td className="p-4 text-right">`;

const newBody = `                         <td className="p-4">
                            <div className="font-label font-bold text-on-surface">{student?.first_name} {student?.last_name}</div>
                         </td>
                         <td className="p-4">
                            <span className="font-title text-sm text-on-surface">{enr.program || 'N/A'}</span>
                         </td>
                         <td className="p-4">
                            <span className="font-body text-sm text-on-surface">{classInfo?.class_name || 'Unassigned'}</span>
                         </td>
                         <td className="p-4">
                            <span className="font-body text-sm text-on-surface-variant">{enr.enrollment_date || 'N/A'}</span>
                         </td>
                         <td className="p-4">
                            <span className="font-body text-sm text-on-surface-variant">{enr.drop_date || 'N/A'}</span>
                         </td>
                         <td className="p-4">
                            <span className={\`px-2 py-0.5 rounded-full text-xs font-bold \${
                              enr.status === 'Active' ? 'bg-primary-container/30 text-primary' : 
                              enr.status === 'Dropped' ? 'bg-error-container/30 text-error' : 
                              enr.status === 'Completed' ? 'bg-tertiary-container/30 text-tertiary' : 
                              'bg-surface-variant text-on-surface-variant'
                            }\`}>
                               {enr.status || 'Active'}
                            </span>
                         </td>
                         <td className="p-4">
                            <span className="font-body text-sm text-on-surface-variant">{enr.notes || ''}</span>
                         </td>
                         <td className="p-4 text-right">`;

content = content.replace(searchBody, newBody);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
