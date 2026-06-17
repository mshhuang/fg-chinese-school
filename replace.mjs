import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

const targetProgram = `<input type="text" required value={enrollmentDetails.program} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, program: e.target.value})} placeholder="e.g. Full-Time, After-School" className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />`;

const replacementProgram = `<select required value={enrollmentDetails.program} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, program: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface">
                           <option value="">-- Select Program --</option>
                           {programs.map(p => (
                              <option key={p.program_id} value={p.program_name}>{p.program_name}</option>
                           ))}
                        </select>`;

content = content.replace(targetProgram, replacementProgram);

const targetGrid = `<div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                           <input type="number" required value={enrollmentDetails.tuition || ''} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, tuition: parseFloat(e.target.value)})} placeholder="0.00" className="pl-12 pr-4 py-3 w-full rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                        </div>
                     </div>`;
                     
const replacementGrid = targetGrid + `
                     <div className="flex flex-col gap-2">
                        <label className="font-label text-sm font-bold text-on-surface-variant">Status</label>
                        <select required value={enrollmentDetails.status} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, status: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface">
                           <option value="Active">Active</option>
                           <option value="Pending">Pending</option>
                           <option value="Dropped">Dropped</option>
                           <option value="Completed">Completed</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="font-label text-sm font-bold text-on-surface-variant">Enrollment Date</label>
                        <input type="date" required value={enrollmentDetails.enrollment_date} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, enrollment_date: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="font-label text-sm font-bold text-on-surface-variant">Drop Date (Optional)</label>
                        <input type="date" value={enrollmentDetails.drop_date} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, drop_date: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                     </div>`;

content = content.replace(targetGrid, replacementGrid);

const targetHeader = `<th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Tuition</th>`;
const replacementHeader = targetHeader + `\n                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Status</th>\n                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Dates</th>`;
content = content.replace(targetHeader, replacementHeader);

const parts = content.split('<th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>');

const targetTd = `<td className="p-4">
                            <span className="font-mono text-sm text-on-surface-variant">$\\{enr.tuition || 0\\}</span>
                         </td>`;
const replacementTd = `<td className="p-4">
                            <span className="font-mono text-sm text-on-surface-variant">$\\{enr.tuition || 0\\}</span>
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
                         </td>`;
                         
content = content.replace('<span className="font-mono text-sm text-on-surface-variant">${enr.tuition || 0}</span>\n                         </td>', '<span className="font-mono text-sm text-on-surface-variant">${enr.tuition || 0}</span>\n                         </td>\n' + `                         <td className="p-4">
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
                         </td>`);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
