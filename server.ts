import crypto from 'crypto';
import fsSync from 'fs';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });


  app.post("/api/supabase/proxy", express.json(), async (req, res) => {
    const { ref, pat, path = '' } = req.body;
    if (!ref || !pat) {
       return res.status(400).json({ error: 'Missing ref or pat' });
    }
    try {
      // Try to fetch project info as a test, or a specific analytics endpoint
      const targetUrl = `https://api.supabase.com/v1/projects/${ref}${path}`;
      const response = await fetch(targetUrl, {
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || response.statusText });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  


function getGitBlobSha(contentBuffer) {
    const header = `blob ${contentBuffer.length}\0`;
    const store = Buffer.concat([Buffer.from(header), contentBuffer]);
    return crypto.createHash('sha1').update(store).digest('hex');
}

function isBinary(buffer) {
    for (let i = 0; i < Math.min(buffer.length, 4000); i++) {
        if (buffer[i] === 0) return true;
    }
    return false;
}

async function getAllLocalFiles(dir, fileList = [], baseDir = dir) {
    const files = fsSync.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', '.git', 'dist', '.env', 'patch_server.cjs'].includes(file)) continue;
        const filePath = path.join(dir, file);
        if (fsSync.statSync(filePath).isDirectory()) {
            getAllLocalFiles(filePath, fileList, baseDir);
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

  app.post('/api/github/sync', express.json({limit: '50mb'}), async (req, res) => {
    const { pat, owner, repo, branch = 'main', syncAll, message = 'Sync from AI Studio' } = req.body;
    if (!pat || !owner || !repo) return res.status(400).json({ error: 'Missing pat, owner, or repo' });

    try {
        const headers = {
            'Authorization': `Bearer ${pat}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Studio-App'
        };

        // 1. Get Ref
        let refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, { headers });
        if (!refRes.ok) {
            // Try to initialize the repository if it's empty
            const initRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/AI_STUDIO_INIT.md`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    message: 'Initialize repository',
                    content: Buffer.from('Initialized by AI Studio.').toString('base64'),
                    branch: branch
                })
            });

            if (!initRes.ok) {
                const err = await initRes.json();
                return res.status(400).json({ 
                    error: `Branch '${branch}' not found. If this is a new repository, it failed to initialize automatically. Check if the branch name is correct (e.g., 'master' instead of 'main'). Details: ${err.message || 'Unknown error'}` 
                });
            }
            
            // Fetch refs again
            refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, { headers });
            if (!refRes.ok) {
                return res.status(404).json({ error: `Branch '${branch}' still not found after initialization.` });
            }
        }

        const refData = await refRes.json();
        const latestCommitSha = refData.object.sha;

        // 2. Get Commit
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
        const commitData = await commitRes.json();
        if (!commitRes.ok) return res.status(400).json({ error: `Failed to get commit: ${commitData.message}` });
        const baseTreeSha = commitData.tree.sha;

        // 3. Get Tree
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${baseTreeSha}?recursive=1`, { headers });
        const treeData = await treeRes.json();
        if (!treeRes.ok) return res.status(400).json({ error: `Failed to get tree: ${treeData.message}` });
        
        const remoteFiles = new Map();
        if (treeData.tree) {
            for (const item of treeData.tree) {
                if (item.type === 'blob') {
                    remoteFiles.set(item.path, item.sha);
                }
            }
        }

        // 4. Local Files
        const cwd = process.cwd();
        const localFilePaths = await getAllLocalFiles(cwd);
        
        const filesToUpdate = [];
        
        for (const filePath of localFilePaths) {
            const relPath = path.relative(cwd, filePath).replace(/\\/g, '/');
            const content = fsSync.readFileSync(filePath);
            const sha = getGitBlobSha(content);
            
            if (syncAll || remoteFiles.get(relPath) !== sha) {
                filesToUpdate.push({ relPath, content });
            }
        }

        if (filesToUpdate.length === 0) {
            return res.json({ message: 'No files changed', updated: 0 });
        }

        // 5. Create Blobs
        const treeNodes = [];
        let blobErrors = [];
        for (let i = 0; i < filesToUpdate.length; i += 10) {
            const batch = filesToUpdate.slice(i, i + 10);
            await Promise.all(batch.map(async (file) => {
                const isBin = isBinary(file.content);
                const encoding = isBin ? 'base64' : 'utf-8';
                const contentStr = isBin ? file.content.toString('base64') : file.content.toString('utf-8');
                
                const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        content: contentStr,
                        encoding: encoding
                    })
                });
                const blobData = await blobRes.json();
                if (!blobRes.ok) {
                    blobErrors.push(`${file.relPath}: ${blobData.message}`);
                } else if (blobData.sha) {
                    treeNodes.push({
                        path: file.relPath,
                        mode: '100644',
                        type: 'blob',
                        sha: blobData.sha
                    });
                }
            }));
        }

        if (blobErrors.length > 0) {
             return res.status(400).json({ error: `Failed to create blobs for some files: ${blobErrors.join(', ')}` });
        }

        if (treeNodes.length === 0) {
            return res.json({ message: 'No files to update after blob creation', updated: 0 });
        }

        // 6. Create Tree
        const newTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                base_tree: baseTreeSha,
                tree: treeNodes
            })
        });
        const newTreeData = await newTreeRes.json();
        if (!newTreeRes.ok) return res.status(400).json({ error: `Failed to create tree: ${newTreeData.message || JSON.stringify(newTreeData)}` });

        // 7. Create Commit
        const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                message: message,
                tree: newTreeData.sha,
                parents: [latestCommitSha]
            })
        });
        const newCommitData = await newCommitRes.json();
        if (!newCommitRes.ok) return res.status(400).json({ error: `Failed to create commit: ${newCommitData.message || JSON.stringify(newCommitData)}` });

        // 8. Update Ref
        const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                sha: newCommitData.sha
            })
        });
        const updateRefData = await updateRefRes.json();
        if (!updateRefRes.ok) return res.status(400).json({ error: `Failed to update ref: ${updateRefData.message || JSON.stringify(updateRefData)}` });

        res.json({ message: 'Successfully synced to GitHub', updated: filesToUpdate.length, commit: newCommitData.html_url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
