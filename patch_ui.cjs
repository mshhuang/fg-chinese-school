const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

const newImports = "import { Database, Table, ArrowLeft, RefreshCw, Activity, HardDrive, Key, BarChart3, AlertCircle, ChevronRight, ExternalLink } from 'lucide-react';";
content = content.replace(/import { Database[^}]* } from 'lucide-react';/, newImports);

const newUI = `
        {/* API Usage via Management API */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
           <div className="w-full md:w-[30%]">
              <h3 className="font-bold text-lg text-on-surface mb-2">Usage Summary</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                 Your plan includes a limited amount of usage. If exceeded, you may experience restrictions, as you are currently not billed for overages. It may take up to 1 hour to refresh.
              </p>
              
              <div className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-3">MORE INFORMATION</div>
              <div className="flex flex-col gap-3">
                 <a href="#" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors w-fit">
                    How billing works <ExternalLink className="w-3.5 h-3.5" />
                 </a>
                 <a href="#" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors w-fit">
                    Supabase Plans <ExternalLink className="w-3.5 h-3.5" />
                 </a>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                 <div className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-3">MANAGE ACCESS</div>
                 <div className="relative mb-3">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input 
                       type="password"
                       placeholder="Personal Access Token"
                       value={supabasePat}
                       onChange={(e) => setSupabasePat(e.target.value)}
                       className="pl-9 pr-4 py-2 bg-surface-lowest border border-outline-variant/50 rounded-md text-sm outline-none focus:border-primary w-full"
                    />
                 </div>
                 <button
                    onClick={fetchUsage}
                    disabled={fetchingUsage}
                    className="w-full py-2 bg-primary-container text-on-primary-container rounded-md hover:bg-primary-container/80 transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {fetchingUsage ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Refresh Metrics"}
                 </button>
                 {usageError && <div className="text-xs text-error mt-2">{usageError}</div>}
              </div>
           </div>
           
           <div className="w-full md:w-[70%] border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-lowest">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-outline-variant/30">
                 
                 {/* Item 1 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Database Size <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {dbInfo?.size || '0 MB'} / 500 MB ({dbInfo?.size_bytes ? ((dbInfo.size_bytes / (500*1024*1024))*100).toFixed(0) : '0'}%)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray={\`\${dbInfo?.size_bytes ? ((dbInfo.size_bytes / (500*1024*1024))*100) : 0}, 100\`} strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 2 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total REST Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_rest_requests?.toLocaleString() || '0'} / 500,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 3 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total Auth Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_auth_requests?.toLocaleString() || '0'} / 50,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 4 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Realtime Concurrent Peak Connections <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {dbInfo?.active_connections || '0'} / 200 ({(dbInfo?.active_connections ? ((dbInfo.active_connections / 200)*100).toFixed(0) : '0')}%)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray={\`\${dbInfo?.active_connections ? ((dbInfo.active_connections / 200)*100) : 0}, 100\`} strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 5 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total Storage Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_storage_requests?.toLocaleString() || '0'} / 10,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 6 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total Realtime Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_realtime_requests?.toLocaleString() || '0'} / 2,000,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 7 */}
                 <div className="p-5 flex justify-between items-center group sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Monthly Active SSO Users
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface-variant">
                          Unavailable in plan
                       </div>
                    </div>
                    <button className="px-3 py-1 bg-[#61E7A5] text-emerald-950 font-bold text-xs rounded hover:bg-[#61E7A5]/90 transition-colors">
                       Upgrade
                    </button>
                 </div>

                 {/* Item 8 */}
                 <div className="p-5 flex justify-between items-center group">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Storage Image Transformations
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface-variant">
                          Unavailable in plan
                       </div>
                    </div>
                    <button className="px-3 py-1 bg-[#61E7A5] text-emerald-950 font-bold text-xs rounded hover:bg-[#61E7A5]/90 transition-colors">
                       Upgrade
                    </button>
                 </div>

              </div>
           </div>
        </div>
`;

content = content.replace(/{\/\* API Usage via Management API \*\/}[\s\S]*?(?={\/\* Tables List \*\/})/m, newUI + "\n\n        ");

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
