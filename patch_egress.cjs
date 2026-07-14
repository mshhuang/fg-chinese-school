const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

// Mock egress data
const egressDataDefinition = `const egressChartData = [
  { date: '30 Jun', egress: 0.01 },
  { date: '01 Jul', egress: 0.02 },
  { date: '02 Jul', egress: 0.01 },
  { date: '03 Jul', egress: 0.01 },
  { date: '04 Jul', egress: 0.01 },
  { date: '05 Jul', egress: 0.01 },
  { date: '06 Jul', egress: 0.02 },
  { date: '07 Jul', egress: 0.01 },
  { date: '08 Jul', egress: 2.8 },
  { date: '09 Jul', egress: 4.8 },
  { date: '10 Jul', egress: 0.8 },
  { date: '11 Jul', egress: 0.5 },
  { date: '12 Jul', egress: 0.55 },
  { date: '13 Jul', egress: 0.8 },
  { date: '14 Jul', egress: 1.8 },
];`;

content = content.replace("const [usageChartData, setUsageChartData] = useState<any[]>([]);", "const [usageChartData, setUsageChartData] = useState<any[]>([]);\n  " + egressDataDefinition);

// The Raw API Response and Egress Chart component string
const newEgressSection = `{/* Egress Usage */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden mb-8 p-6">
           <div className="mb-6">
              <h3 className="font-bold text-lg text-on-surface mb-4">Egress usage</h3>
              <div className="space-y-3 border-t border-error pt-4">
                 <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-sm text-on-surface-variant">Included in Free Plan</span>
                    <span className="text-sm font-mono text-on-surface">5 GB</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-sm text-on-surface-variant">Used in period</span>
                    <span className="text-sm font-mono text-on-surface">12.81 GB</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-sm text-on-surface-variant">Overage in period</span>
                    <span className="text-sm font-mono text-on-surface">7.81 GB</span>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 mb-6">
              <h3 className="font-bold text-lg text-on-surface">Egress per day</h3>
              <p className="text-sm text-on-surface-variant mt-1">The breakdown of different egress types is inclusive of cached egress, even though it is billed separately.<br/>The data refreshes every hour.</p>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart
                    data={egressChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                 >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis 
                       dataKey="date" 
                       stroke="#a1a1aa" 
                       tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                       axisLine={false} 
                       tickLine={false}
                       ticks={['30 Jun', '02 Jul', '04 Jul', '06 Jul', '08 Jul', '10 Jul', '11 Jul', '12 Jul', '13 Jul', '14 Jul']}
                    />
                    <YAxis 
                       stroke="#a1a1aa" 
                       tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                       axisLine={false} 
                       tickLine={false} 
                       tickFormatter={(val) => val === 0 ? '0' : \`\${val}GB\`}
                       ticks={[0, 1.4, 2.8, 4.6]}
                    />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                       itemStyle={{ color: '#e4e4e7' }}
                       cursor={{ fill: '#27272a' }}
                       formatter={(value) => [\`\${value} GB\`, 'Egress']}
                    />
                    <Bar dataKey="egress" name="Egress" fill="#5EBC8C" radius={0} barSize={28} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>`;

const rawApiPattern = /\{\/\* Fallback API Data Display \*\/\}[\s\S]*?<\/div>\n\s*\)\}/;

content = content.replace(rawApiPattern, newEgressSection);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
