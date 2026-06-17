const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

// 1. Remove tuition from state
content = content.replace(
`  const [enrollmentDetails, setEnrollmentDetails] = useState({
    class_id: "",
    program: "",
    notes: "",
    tuition: 0,
    status: "Active",`,
`  const [enrollmentDetails, setEnrollmentDetails] = useState({
    class_id: "",
    program: "",
    notes: "",
    status: "Active",`
);

// 2. Remove tuition from mapping
content = content.replace(
`       program: enrollmentDetails.program,
       notes: enrollmentDetails.notes,
       tuition: enrollmentDetails.tuition,
       status: enrollmentDetails.status,`,
`       program: enrollmentDetails.program,
       notes: enrollmentDetails.notes,
       status: enrollmentDetails.status,`
);

// 3. Remove tuition from reset state
content = content.replace(
`       setEnrollmentDetails({ class_id: "", program: "", notes: "", tuition: 0, status: "Active", enrollment_date: new Date().toISOString().split('T')[0], drop_date: "" });`,
`       setEnrollmentDetails({ class_id: "", program: "", notes: "", status: "Active", enrollment_date: new Date().toISOString().split('T')[0], drop_date: "" });`
);

// 4. Update text
content = content.replace(
`Manage student enrollments, programs, and tuition.`,
`Manage student enrollments and programs.`
);

// 5. Remove tuition input and move notes
const inputSection = `                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Notes</label>
                       <input type="text" value={enrollmentDetails.notes} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, notes: e.target.value})} placeholder="e.g. Additional info" className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Tuition ($)</label>
                       <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                          <input type="number" required value={enrollmentDetails.tuition || ''} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, tuition: parseFloat(e.target.value)})} placeholder="0.00" className="pl-12 pr-4 py-3 w-full rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Status</label>
                       <select required value={enrollmentDetails.status} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, status: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface">
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

const newInputSection = `                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Status</label>
                       <select required value={enrollmentDetails.status} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, status: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface">
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
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Notes</label>
                       <input type="text" value={enrollmentDetails.notes} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, notes: e.target.value})} placeholder="e.g. Additional info" className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                    </div>`;

content = content.replace(inputSection, newInputSection);

// 6. Remove tuition th
content = content.replace(
`<th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Class</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Tuition</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Status</th>`,
`<th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Class</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Status</th>`
);

content = content.replace(
`<td colSpan={5} className="p-8 text-center text-on-surface-variant font-body">Loading...</td>`,
`<td colSpan={6} className="p-8 text-center text-on-surface-variant font-body">Loading...</td>`
);

content = content.replace(
`<td colSpan={5} className="p-8 text-center text-on-surface-variant font-body">No enrollments found.</td>`,
`<td colSpan={6} className="p-8 text-center text-on-surface-variant font-body">No enrollments found.</td>`
);


// 7. Remove tuition td
content = content.replace(
`<td className="p-4">
                            <span className="font-body text-sm text-on-surface-variant">{classInfo?.class_name || 'Unassigned'}</span>
                         </td>
                         <td className="p-4">
                            <span className="font-mono text-sm text-on-surface-variant">$\\{enr.tuition || 0\\}</span>
                         </td>`,
`<td className="p-4">
                            <span className="font-body text-sm text-on-surface-variant">{classInfo?.class_name || 'Unassigned'}</span>
                         </td>`
);

content = content.replace(
  'import { Plus, Search, Filter, Mail, DollarSign, BookOpen, User, CalendarIcon, Trash2 } from "lucide-react";',
  'import { Plus, Search, Filter, Mail, BookOpen, User, CalendarIcon, Trash2 } from "lucide-react";'
);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
