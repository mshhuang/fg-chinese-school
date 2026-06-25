const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');

// Add activeTab state
code = code.replace(
  "const [loading, setLoading] = useState(false);",
  "const [loading, setLoading] = useState(false);\n  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');"
);

const oldRender = `{assignments.length === 0 ? (
            <div className="bg-surface-container-low p-12 rounded-3xl border border-outline-variant/30 text-center flex flex-col items-center">
              <FileText className="w-12 h-12 text-on-surface-variant/30 mb-4" />
              <p className="font-label font-bold text-on-surface-variant">No assignments created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {assignments.map(a => (`;

const newRender = `
          {(() => {
            const filteredAssignments = assignments.filter(a => activeTab === 'active' ? (!a.due_date || new Date(a.due_date) >= new Date()) : (a.due_date && new Date(a.due_date) < new Date()));
            if (filteredAssignments.length === 0) {
              return (
                <div className="bg-surface-container-low p-12 rounded-3xl border border-outline-variant/30 text-center flex flex-col items-center">
                  <FileText className="w-12 h-12 text-on-surface-variant/30 mb-4" />
                  <p className="font-label font-bold text-on-surface-variant">{activeTab === 'active' ? 'No active assignments.' : 'No assignment history.'}</p>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAssignments.map(a => (
`;

code = code.replace(oldRender, newRender);

code = code.replace(
  '<h2 className="font-title text-xl font-bold text-on-surface mb-2">Class Assignments</h2>',
  `<div className="flex items-center gap-4 border-b border-outline-variant/30 pb-2 mb-4">
            <button onClick={() => setActiveTab('active')} className={\`font-title text-xl font-bold px-4 py-2 \${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}\`}>Active</button>
            <button onClick={() => setActiveTab('history')} className={\`font-title text-xl font-bold px-4 py-2 \${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}\`}>History</button>
          </div>`
);
// Make sure to close the block. The old code had:
//   ))}
//   </div>
// )}
// We need to replace the `)}` closing with `);})()}`

const closingOld = `))}
            </div>
          )}`;
const closingNew = `))}
            </div>
          );
          })()}`;

code = code.replace(closingOld, closingNew);

fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
