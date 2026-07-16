import React, { useState, useEffect } from 'react';
import { Github, UploadCloud, FileDiff, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuilderGitHubSync() {
  const navigate = useNavigate();
  const [pat, setPat] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [updatedCount, setUpdatedCount] = useState(0);

  useEffect(() => {
    const savedPat = localStorage.getItem('github_pat') || '';
    const savedOwner = localStorage.getItem('github_owner') || '';
    const savedRepo = localStorage.getItem('github_repo') || '';
    const savedBranch = localStorage.getItem('github_branch') || 'main';
    
    setPat(savedPat);
    setOwner(savedOwner);
    setRepo(savedRepo);
    setBranch(savedBranch);
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem('github_pat', pat);
    localStorage.setItem('github_owner', owner);
    localStorage.setItem('github_repo', repo);
    localStorage.setItem('github_branch', branch);
  };

  const handleSync = async (syncAll: boolean) => {
    if (!pat || !owner || !repo) {
       setSyncStatus('error');
       setSyncMessage('Please provide Personal Access Token, Repository Owner, and Repository Name.');
       return;
    }
    
    handleSaveConfig();
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');
    
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pat, owner, repo, branch, syncAll, message: `Sync from Builder Dashboard (${syncAll ? 'Full' : 'Incremental'})`
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.error || 'Failed to sync');
      }
      
      setSyncStatus('success');
      setSyncMessage(data.message || 'Successfully synced to GitHub.');
      setUpdatedCount(data.updated || 0);
      
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err.message || 'An error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
            onClick={() => navigate('/builder/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-on-surface">GitHub Sync</h1>
            <p className="font-body text-on-surface-variant text-sm">Sync local workspace files directly to a GitHub repository.</p>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h2 className="font-title text-lg font-bold text-on-surface mb-4">Repository Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">GitHub PAT (Personal Access Token)</label>
              <input 
                type="password" 
                value={pat} 
                onChange={e => setPat(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm text-on-surface"
                placeholder="ghp_..."
              />
              <p className="text-xs text-on-surface-variant mt-1">Requires 'repo' scope. Stored locally in your browser.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Repository Owner / Organization</label>
              <input 
                type="text" 
                value={owner} 
                onChange={e => setOwner(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm text-on-surface"
                placeholder="e.g. facebook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Repository Name</label>
              <input 
                type="text" 
                value={repo} 
                onChange={e => setRepo(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm text-on-surface"
                placeholder="e.g. react"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Branch</label>
              <input 
                type="text" 
                value={branch} 
                onChange={e => setBranch(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm text-on-surface"
                placeholder="main"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h2 className="font-title text-lg font-bold text-on-surface mb-4">Sync Actions</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
             <button 
               onClick={() => handleSync(false)}
               disabled={isSyncing}
               className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
             >
                <FileDiff className="w-5 h-5" />
                {isSyncing ? 'Syncing...' : 'Sync Differences Only'}
             </button>
             <button 
               onClick={() => handleSync(true)}
               disabled={isSyncing}
               className="flex-1 flex items-center justify-center gap-2 bg-surface-variant text-on-surface-variant border border-outline-variant font-bold py-3 px-4 rounded-xl hover:bg-surface-variant/80 transition-colors disabled:opacity-50"
             >
                <UploadCloud className="w-5 h-5" />
                {isSyncing ? 'Syncing...' : 'Force Sync All Files'}
             </button>
          </div>

          {syncStatus === 'success' && (
            <div className="bg-primary-container/20 border border-primary/30 p-4 rounded-xl flex items-start gap-3">
               <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
               <div>
                  <h4 className="font-bold text-primary">Sync Successful</h4>
                  <p className="text-sm text-on-surface-variant">{syncMessage}</p>
                  <p className="text-sm font-medium text-on-surface mt-1">Files updated: {updatedCount}</p>
               </div>
            </div>
          )}

          {syncStatus === 'error' && (
            <div className="bg-error-container/20 border border-error/30 p-4 rounded-xl flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
               <div>
                  <h4 className="font-bold text-error">Sync Failed</h4>
                  <p className="text-sm text-on-surface-variant">{syncMessage}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
