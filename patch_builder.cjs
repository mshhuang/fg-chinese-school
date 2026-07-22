const fs = require('fs');
let code = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

// We need to add an Action column to the table and a clear function
if (!code.includes('handleClearTable')) {
    // Inject the function inside the component
    // Search for 'const [timeRange, setTimeRange] = useState("7d");' to insert the function nearby
    code = code.replace(
        'const [timeRange, setTimeRange] = useState("7d");',
        `const [timeRange, setTimeRange] = useState("7d");
  const [clearingTable, setClearingTable] = useState<string | null>(null);

  const handleClearTable = async (tableName: string) => {
    if (!window.confirm(\`Are you sure you want to delete ALL records in \${tableName}? This cannot be undone.\`)) return;
    setClearingTable(tableName);
    try {
        const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Note: 'id' might need to be dynamic or we just use a generic true condition, in PostgREST we can just do neq on a known column or use delete().neq('created_at', '1970-01-01')
        // Actually, deleting all without condition in Supabase might fail depending on RLS. If RLS allows, neq works.
        // Let's use delete() with a catch-all condition if needed, or simply delete().neq('created_at', '1900-01-01') if it has created_at
        // For system_logs, it's log_id.
        let conditionColumn = 'id';
        if (tableName === 'system_logs' || tableName === 'error_logs' || tableName === 'audit_logs') {
            conditionColumn = 'log_id';
        }
        const { error: err } = await supabase.from(tableName).delete().neq(conditionColumn, '00000000-0000-0000-0000-000000000000');
        if (err) throw err;
        alert(\`Successfully cleared \${tableName}\`);
        
        // Refresh stats
        const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
        setTableStats(prev => prev.map(t => t.name === tableName ? { ...t, count: count || 0 } : t));
    } catch (e: any) {
        alert('Failed to clear table: ' + e.message);
    } finally {
        setClearingTable(null);
    }
  };`
    );

    // Update the table header
    code = code.replace(
        '<th className="px-6 py-4 rounded-tr-xl whitespace-nowrap">Status</th>',
        '<th className="px-6 py-4 whitespace-nowrap">Status</th>\n                       <th className="px-6 py-4 rounded-tr-xl whitespace-nowrap">Actions</th>'
    );

    // Update the map to show all tables (remove .filter(stat => stat.name === 'system_logs'))
    code = code.replace(
        ") : tableStats.filter(stat => stat.name === 'system_logs').map((stat, i) => (",
        ") : tableStats.map((stat, i) => ("
    );

    // Update the table body row
    code = code.replace(
        '                             </span>\n                          </td>\n                       </tr>',
        `                             </span>
                          </td>
                          <td className="px-6 py-4">
                             {['system_logs', 'error_logs', 'audit_logs'].includes(stat.name) && (
                                <button 
                                   onClick={() => handleClearTable(stat.name)}
                                   disabled={clearingTable === stat.name}
                                   className="px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                   {clearingTable === stat.name ? 'Clearing...' : 'Clear Data'}
                                </button>
                             )}
                          </td>
                       </tr>`
    );
    
    fs.writeFileSync('src/pages/BuilderDatabase.tsx', code);
    console.log('Patched BuilderDatabase.tsx');
}
