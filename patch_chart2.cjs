const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

// Add state for chart data
content = content.replace("const [usageData, setUsageData] = useState<any>(null);", "const [usageData, setUsageData] = useState<any>(null);\n  const [usageChartData, setUsageChartData] = useState<any[]>([]);");

// Update fetch logic
content = content.replace(/if \(Array\.isArray\(data\) && data\.length > 0\) \{[\s\S]*?\} else if \(data && data\.result && data\.result\.length > 0\) \{[\s\S]*?\} else \{[\s\S]*?\}/, 
`if (Array.isArray(data) && data.length > 0) {
         setUsageData(data[data.length - 1]);
         setUsageChartData(data);
      } else if (data && data.result && data.result.length > 0) {
         setUsageData(data.result[data.result.length - 1]);
         setUsageChartData(data.result);
      } else {
         setUsageData(data);
         setUsageChartData([]);
      }`);

content = content.replace(/setUsageData\(\{\s*total_rest_requests: 124500,[\s\S]*?\}\);/,
`setUsageData({
         total_rest_requests: 124500,
         total_auth_requests: 3200,
         total_realtime_requests: 850000,
         total_storage_requests: 420
      });
      setUsageChartData([
         { timestamp: 'Mon', total_rest_requests: 4200, total_auth_requests: 110, total_realtime_requests: 21000 },
         { timestamp: 'Tue', total_rest_requests: 3800, total_auth_requests: 150, total_realtime_requests: 25000 },
         { timestamp: 'Wed', total_rest_requests: 5100, total_auth_requests: 230, total_realtime_requests: 31000 },
         { timestamp: 'Thu', total_rest_requests: 4700, total_auth_requests: 210, total_realtime_requests: 28000 },
         { timestamp: 'Fri', total_rest_requests: 6200, total_auth_requests: 300, total_realtime_requests: 41000 },
         { timestamp: 'Sat', total_rest_requests: 2100, total_auth_requests: 80, total_realtime_requests: 15000 },
         { timestamp: 'Sun', total_rest_requests: 1800, total_auth_requests: 50, total_realtime_requests: 12000 },
      ]);`);

// Replace chart JSX
const oldChart = `{/* Egress Chart */}
        {usageData && usageData.egress_data && (
           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden mb-8 p-6">
              <div className="mb-6">
                 <h3 className="font-bold text-lg text-on-surface">Egress Usage vs Cached Egress</h3>
                 <p className="text-sm text-on-surface-variant">Data transfer in GB over the last 7 days</p>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                       data={usageData.egress_data}
                       margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                       <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                       <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                       <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(val) => \`\${val}GB\`} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                          itemStyle={{ color: '#e4e4e7' }}
                          cursor={{ fill: '#27272a' }}
                       />
                       <Legend wrapperStyle={{ paddingTop: '20px' }} />
                       <Bar dataKey="Egress" name="Standard Egress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="Cached" name="Cached Egress" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        )}`;

const newChart = `{/* API Usage Chart */}
        {usageChartData && usageChartData.length > 0 && (
           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden mb-8 p-6">
              <div className="mb-6">
                 <h3 className="font-bold text-lg text-on-surface">API Requests Over Time</h3>
                 <p className="text-sm text-on-surface-variant">API requests handled in the selected period</p>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                       data={usageChartData.map(d => ({
                          ...d,
                          name: d.timestamp.includes('T') ? new Date(d.timestamp).getHours() + ':00' : d.timestamp
                       }))}
                       margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                       <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                       <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                       <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                          itemStyle={{ color: '#e4e4e7' }}
                          cursor={{ fill: '#27272a' }}
                       />
                       <Legend wrapperStyle={{ paddingTop: '20px' }} />
                       <Bar dataKey="total_rest_requests" name="REST API" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="total_realtime_requests" name="Realtime" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        )}`;

content = content.replace(oldChart, newChart);
fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
