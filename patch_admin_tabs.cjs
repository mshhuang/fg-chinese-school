const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

const oldTabs = `<div className="flex gap-4 border-b border-outline-variant/30 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('users')}
            className={\`pb-4 font-label font-bold text-sm transition-all border-b-2 whitespace-nowrap \${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Directory
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={\`pb-4 font-label font-bold text-sm transition-all border-b-2 whitespace-nowrap \${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Roles & Permissions
          </button>
          <button 
            onClick={() => setActiveTab('families')}
            className={\`pb-4 font-label font-bold text-sm transition-all border-b-2 whitespace-nowrap \${activeTab === 'families' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Families
          </button>
          <button 
            onClick={() => {
              setActiveTab('icons');
              setShowAdd(false);
              setShowAddRole(false);
              setShowAddFamily(false);
            }}
            className={\`pb-4 font-label font-bold text-sm transition-all border-b-2 whitespace-nowrap \${activeTab === 'icons' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Icon Reference
          </button>
      </div>`;

const newTabs = `<div className="flex p-1.5 bg-surface-container-low rounded-2xl w-full md:w-fit border border-outline-variant/30 shadow-sm overflow-x-auto hide-scrollbar shrink-0">
          <button 
            onClick={() => setActiveTab('users')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'users' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Directory
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'roles' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Roles & Permissions
          </button>
          <button 
            onClick={() => setActiveTab('families')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'families' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Families
          </button>
          <button 
            onClick={() => {
              setActiveTab('icons');
              setShowAdd(false);
              setShowAddRole(false);
              setShowAddFamily(false);
            }}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'icons' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Icon Reference
          </button>
      </div>`;

code = code.replace(oldTabs, newTabs);
fs.writeFileSync('src/pages/AdminUsers.tsx', code);
