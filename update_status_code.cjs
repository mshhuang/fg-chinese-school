const fs = require('fs');

function patchPrincipal(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    
    // Replace Principal updates
    code = code.replace(
        /const \{ error \} = await supabase\.from\('newsletters'\)\.update\(\{\n\s*content: JSON\.stringify\(updatedProps\)\n\s*\}\)\.eq/g,
        'const { error } = await supabase.from(\'newsletters\').update({\n             content: JSON.stringify(updatedProps),\n             status: updatedProps.status\n         }).eq'
    );
    
    code = code.replace(
        /await supabase\.from\('newsletters'\)\.update\(\{ content: JSON\.stringify\(updatedProps\), is_published: true \}\)\.eq\('newsletter_id', postModal\.id\);/g,
        'await supabase.from(\'newsletters\').update({ content: JSON.stringify(updatedProps), is_published: true, status: updatedProps.status }).eq(\'newsletter_id\', postModal.id);'
    );
    
    fs.writeFileSync(filepath, code);
}

function patchTeacher(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    
    // Insert
    code = code.replace(
        /const \{ data, error \} = await supabase\.from\('newsletters'\)\.insert\(\[\{\n\s*title,\n\s*author_id: authorId,\n\s*class_id: classId,\n\s*content: JSON\.stringify\(payloadProps\)\n\s*\}\]\) as any\)\.select\(\);/g,
        'const { data, error } = await supabase.from(\'newsletters\').insert([{\n               title,\n               author_id: authorId,\n               class_id: classId,\n               content: JSON.stringify(payloadProps),\n               status: payloadProps.status\n           }] as any).select();'
    );
    
    // Update main
    code = code.replace(
        /const \{ error \} = await supabase\.from\('newsletters'\)\.update\(\{\n\s*title,\n\s*content: JSON\.stringify\(payloadProps\)\n\s*\}\)\.eq/g,
        'const { error } = await supabase.from(\'newsletters\').update({\n               title,\n               content: JSON.stringify(payloadProps),\n               status: payloadProps.status\n           }).eq'
    );
    
    // Update delete/submit
    code = code.replace(
        /const \{ error \} = await supabase\.from\('newsletters'\)\.update\(\{\n\s*content: JSON\.stringify\(updatedProps\)\n\s*\}\)\.eq/g,
        'const { error } = await supabase.from(\'newsletters\').update({\n             content: JSON.stringify(updatedProps),\n             status: updatedProps.status\n         }).eq'
    );

    fs.writeFileSync(filepath, code);
}

patchPrincipal('src/pages/PrincipalNewsletters.tsx');
patchTeacher('src/pages/TeacherNewsletters.tsx');

console.log("Updated code to sync status column");
