const fs = require('fs');
let code = fs.readFileSync('src/pages/BuilderStorage.tsx', 'utf8');

const listFilesTarget = `  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: listError } = await supabase.storage.from(selectedBucket).list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (listError) throw listError;
      setFiles(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };`;

const listFilesReplace = `  const listAllFiles = async (bucketName: string, path = ''): Promise<any[]> => {
    let allFiles: any[] = [];
    const { data, error } = await supabase.storage.from(bucketName).list(path, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) return allFiles;
    for (const item of data || []) {
      if (item.id === null && !item.metadata) {
        // It's a folder
        const subPath = path ? \`\${path}/\${item.name}\` : item.name;
        const subFiles = await listAllFiles(bucketName, subPath);
        allFiles = allFiles.concat(subFiles);
      } else {
        allFiles.push({
          ...item,
          fullPath: path ? \`\${path}/\${item.name}\` : item.name
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
  };`;

code = code.replace(listFilesTarget, listFilesReplace);

const deleteTarget = `  const handleDelete = async (fileName: string) => {
    if (!confirm(\`Are you sure you want to delete \${fileName}?\`)) return;
    try {
      const { error: delError } = await supabase.storage.from(selectedBucket).remove([fileName]);
      if (delError) throw delError;
      setFiles(prev => prev.filter(f => f.name !== fileName));
    } catch (err: any) {
      alert("Failed to delete file: " + err.message);
    }
  };`;

const deleteReplace = `  const handleDelete = async (file: any) => {
    const filePath = file.fullPath || file.name;
    if (!confirm(\`Are you sure you want to delete \${file.name}?\`)) return;
    try {
      const { error: delError } = await supabase.storage.from(selectedBucket).remove([filePath]);
      if (delError) throw delError;
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (err: any) {
      alert("Failed to delete file: " + err.message);
    }
  };`;

code = code.replace(deleteTarget, deleteReplace);

const mapTarget = `                {files.filter(f => f.name !== '.emptyFolderPlaceholder').map(file => {
                  const isImage = file.metadata?.mimetype?.startsWith('image/');
                  const url = getPublicUrl(file.name);
                  return (
                    <tr key={file.id || file.name} className="border-b border-outline-variant/40 last:border-0 hover:bg-surface-variant/10">
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
                            <p className="font-body font-bold text-on-surface break-all">{file.name}</p>
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
                        <button onClick={() => handleDelete(file.name)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}`;

const mapReplace = `                {files.filter(f => f.name !== '.emptyFolderPlaceholder').map(file => {
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
                })}`;

code = code.replace(mapTarget, mapReplace);

fs.writeFileSync('src/pages/BuilderStorage.tsx', code);
console.log("Patched!");
