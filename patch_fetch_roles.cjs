const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

// 1. Add state for roles
code = code.replace(
  'const [selectedClasses, setSelectedClasses] = useState<string[]>([]);',
  'const [selectedClasses, setSelectedClasses] = useState<string[]>([]);\n  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);\n  const [availableRoles, setAvailableRoles] = useState<{role_id: number, role_name: string}[]>([]);'
);

// 2. Fetch roles
const fetchClassesTarget = `    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase.from('classes').select('class_id, class_name');
        if (data) setAvailableClasses(data);
      } catch(e){}
    };
    fetchClasses();`;

const fetchClassesReplacement = `    const fetchClassesAndRoles = async () => {
      try {
        const { data: cData } = await supabase.from('classes').select('class_id, class_name');
        if (cData) setAvailableClasses(cData);
        const { data: rData } = await supabase.from('roles').select('role_id, role_name');
        if (rData) setAvailableRoles(rData.filter(r => [4, 5, 9].includes(r.role_id))); // Teacher, Student, Parent
      } catch(e){}
    };
    fetchClassesAndRoles();`;

code = code.replace(fetchClassesTarget, fetchClassesReplacement);

// 3. payload handling
const payloadTarget = `      const payload: any = {
          title: \`Newsletter: \${postModal.title}\`,
          content: encodedContent,
          target_class_ids: selectedClasses,
          target_role_ids: [],
          target_user_ids: [],
          created_by: 'ec13df7f-1a4f-422e-abd8-05732ca798d2'
      };`;

const payloadReplacement = `      const payload: any = {
          title: \`Newsletter: \${postModal.title}\`,
          content: encodedContent,
          target_class_ids: selectedClasses,
          target_role_ids: selectedRoles,
          target_user_ids: [],
          created_by: 'ec13df7f-1a4f-422e-abd8-05732ca798d2'
      };`;

code = code.replace(payloadTarget, payloadReplacement);

// 4. modify UI to include roles
const postModalTarget = `<p className="text-on-surface-variant mb-4 text-sm font-body">Select the classes to post this newsletter to.</p>
                       <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 pr-2">`;

const postModalReplacement = `<p className="text-on-surface-variant mb-4 text-sm font-body">Select the audience to post this newsletter to.</p>
                       <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 pr-2">
                           <div className="text-xs font-bold font-label uppercase text-on-surface-variant mt-2 mb-1">Target Roles</div>
                           {availableRoles.map(r => (
                               <label key={r.role_id} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-variant/30 cursor-pointer transition-colors">
                                   <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                     checked={selectedRoles.includes(r.role_id)}
                                     onChange={(e) => {
                                         if (e.target.checked) {
                                             setSelectedRoles(prev => [...prev, r.role_id]);
                                         } else {
                                             setSelectedRoles(prev => prev.filter(id => id !== r.role_id));
                                         }
                                     }}
                                   />
                                   <span className="font-label text-sm text-on-surface font-bold">All {r.role_name}s</span>
                               </label>
                           ))}
                           <div className="text-xs font-bold font-label uppercase text-on-surface-variant mt-2 mb-1">Target Classes</div>`;

code = code.replace(postModalTarget, postModalReplacement);

// Update button disabled state
code = code.replace('disabled={selectedClasses.length === 0}', 'disabled={selectedClasses.length === 0 && selectedRoles.length === 0}');

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched roles");
