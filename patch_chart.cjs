const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

const chartBlock = `
        {/* Egress Chart */}
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
        )}

        {/* Fallback API Data Display */}`;

content = content.replace("{/* Fallback API Data Display */}", chartBlock);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
