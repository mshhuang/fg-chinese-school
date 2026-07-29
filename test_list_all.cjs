const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listAllFiles(bucketName, path = '') {
    let allFiles = [];
    const { data, error } = await supabase.storage.from(bucketName).list(path);
    if (error) return allFiles;
    for (const item of data) {
        if (item.id === null) {
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
}

async function main() {
    const files = await listAllFiles('announcements');
    console.log(files);
}
main();
