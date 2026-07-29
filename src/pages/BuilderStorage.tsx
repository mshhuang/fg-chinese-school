import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Folder, File, RefreshCw, Eye, Image as ImageIcon, FileText, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BuilderStorage() {
  const [buckets, setBuckets] = useState<string[]>(['class_photos', 'class_images', 'newsletter_pdfs', 'announcements']);
  const [selectedBucket, setSelectedBucket] = useState('class_photos');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{name: string, url: string, isImage: boolean} | null>(null);

  useEffect(() => {
    loadFiles();
  }, [selectedBucket]);

  const listAllFiles = async (bucketName: string, path = ''): Promise<any[]> => {
    let allFiles: any[] = [];
    const { data, error } = await supabase.storage.from(bucketName).list(path, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) return allFiles;
    for (const item of data || []) {
      if (item.id === null && !item.metadata) {
        // It's a folder
        const subPath = path ? `${path}/${item.name}` : item.name;
        const subFiles = await listAllFiles(bucketName, subPath);
        allFiles = allFiles.concat(subFiles);
      } else {
        allFiles.push({
          ...item,
          fullPath: path ? `${path}/${item.name}` : item.name
        });
      }
    }
    return allFiles;
  };

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllFiles(selectedBucket);
      setFiles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: any) => {
    const filePath = file.fullPath || file.name;
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;
    try {
      const { error: delError } = await supabase.storage.from(selectedBucket).remove([filePath]);
      if (delError) throw delError;
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (err: any) {
      alert("Failed to delete file: " + err.message);
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from(selectedBucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Storage Viewer</h1>
          <p className="font-body text-lg text-on-surface-variant mt-2">Manage files across all buckets.</p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-outline-variant/40 pb-2">
        {buckets.map(b => (
          <button
            key={b}
            onClick={() => setSelectedBucket(b)}
            className={cn(
              "px-4 py-2 font-label rounded-t-lg transition-colors",
              selectedBucket === b ? "bg-primary text-on-primary font-bold" : "bg-surface hover:bg-surface-variant/50 text-on-surface"
            )}
          >
            {b}
          </button>
        ))}
        <button onClick={loadFiles} className="ml-auto px-4 py-2 flex items-center gap-2 font-label text-primary hover:bg-primary/10 rounded-lg">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl font-body">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center gap-4">
            <Folder className="w-12 h-12 opacity-50" />
            <p>No files found in {selectedBucket}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/40 bg-surface-variant/20">
                  <th className="p-4 font-label text-sm text-on-surface-variant font-bold">Name</th>
                  <th className="p-4 font-label text-sm text-on-surface-variant font-bold w-32">Size</th>
                  <th className="p-4 font-label text-sm text-on-surface-variant font-bold w-48">Created</th>
                  <th className="p-4 font-label text-sm text-on-surface-variant font-bold w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.filter(f => f.name !== '.emptyFolderPlaceholder').map(file => {
                  const isImage = file.metadata?.mimetype?.startsWith('image/');
                  const filePath = file.fullPath || file.name;
                  const url = getPublicUrl(filePath);
                  return (
                    <tr key={file.id || filePath} className="border-b border-outline-variant/40 last:border-0 hover:bg-surface-variant/10">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {isImage ? (
                            <img src={url} alt={file.name} className="w-10 h-10 object-cover rounded shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-body font-bold text-on-surface break-all">{filePath}</p>
                            <p className="font-body text-xs text-on-surface-variant">{file.metadata?.mimetype || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-body text-sm">{formatSize(file.metadata?.size || 0)}</td>
                      <td className="p-4 font-body text-sm">{new Date(file.created_at).toLocaleString()}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => setPreviewFile({ name: file.name, url, isImage: !!isImage })} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Open in new tab">
                          <FileText className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDelete(file)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center bg-surface/50 backdrop-blur-md">
              <h3 className="font-display text-xl text-on-surface font-bold truncate pr-4">{previewFile.name}</h3>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-surface-variant/20 p-4 flex items-center justify-center">
              {previewFile.isImage ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-on-surface-variant">
                  <FileText className="w-20 h-20 opacity-50" />
                  <p className="text-lg">PDFs might not preview inline depending on your browser.</p>
                  <a href={previewFile.url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary/90 transition-colors shadow-sm">
                    Open PDF in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
