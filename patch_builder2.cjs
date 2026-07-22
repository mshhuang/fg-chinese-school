const fs = require('fs');
let code = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

code = code.replace(
  "const [usageError, setUsageError] = useState('');",
  `const [usageError, setUsageError] = useState('');

  const [clearingTable, setClearingTable] = useState<string | null>(null);
  
  const handleClearTable = async (tableName: string) => {
    if (!window.confirm(\`Are you sure you want to delete ALL records in \${tableName}? This cannot be undone.\`)) return;
    setClearingTable(tableName);
    try {
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

fs.writeFileSync('src/pages/BuilderDatabase.tsx', code);
console.log('Patched');
