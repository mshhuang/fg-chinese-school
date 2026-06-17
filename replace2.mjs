import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

const targetStr = `                     <div className="flex flex-col gap-2">
                        <label className="font-label text-sm font-bold text-on-surface-variant">Tuition ($)</label>
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                           <input type="number" required value={enrollmentDetails.tuition || ''} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, tuition: parseFloat(e.target.value)})} placeholder="0.00" className="pl-12 pr-4 py-3 w-full rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                        </div>
                     </div>
                  </div>`;
const replaceStr = `                     <div className="flex flex-col gap-2">
                        <label className="font-label text-sm font-bold text-on-surface-variant">Tuition ($)</label>
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                           <input type="number" required value={enrollmentDetails.tuition || ''} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, tuition: parseFloat(e.target.value)})} placeholder="0.00" className="pl-12 pr-4 py-3 w-full rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                        </div>
                     </div>
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
                     </div>
                  </div>`;
content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
