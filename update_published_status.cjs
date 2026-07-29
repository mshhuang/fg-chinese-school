const fs = require('fs');

function patchPrincipal(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    
    // 1. Change "Ready to Post" to "Approved"
    code = code.replace(/"Ready to Post"/g, '"Approved"');
    code = code.replace(/'Ready to Post'/g, "'Approved'");
    
    // 2. Add "Published" to STATUSES
    code = code.replace(
        'const STATUSES = ["All", "Pending Approval", "Rejected", "Approved"];',
        'const STATUSES = ["All", "Pending Approval", "Rejected", "Approved", "Published"];'
    );

    // 3. Update handlePostAnnouncement to update the newsletter status
    const postTarget = `          const allTargets = [...selectedRoleNames, ...selectedClassNames].join(', ');
          alert(\`Posted to announcement board successfully to: \${allTargets}\`);
          setPostModal(null);
      } catch (err) {`;
    
    const postReplacement = `          const allTargets = [...selectedRoleNames, ...selectedClassNames].join(', ');
          
          const newsletter = newsletters.find(n => n.id === postModal.id);
          if (newsletter) {
             const updatedProps = { ...newsletter, status: 'Published', posted_to: allTargets };
             delete updatedProps.id;
             delete updatedProps.title;
             delete updatedProps.class_id;
             await supabase.from('newsletters').update({ content: JSON.stringify(updatedProps), is_published: true }).eq('newsletter_id', postModal.id);
          }

          alert(\`Posted to announcement board successfully to: \${allTargets}\`);
          setPostModal(null);
          await loadNewsletters();
      } catch (err) {`;
      
    code = code.replace(postTarget, postReplacement);
    
    // 4. Update the audience text
    code = code.replace(
        '<span className="font-label text-xs uppercase tracking-wider font-bold">{news.audience || groupName}</span>',
        '<span className="font-label text-xs uppercase tracking-wider font-bold text-ellipsis overflow-hidden line-clamp-1">{news.posted_to || news.audience || groupName}</span>'
    );
    
    // 5. Update Published styling
    const styleTarget = `news.status === "Approved" ? "bg-primary-container/20 text-primary border border-primary/20" : `;
    const styleReplace = `news.status === "Approved" ? "bg-primary-container/20 text-primary border border-primary/20" : \n                               news.status === "Published" ? "bg-secondary-container/20 text-secondary border border-secondary/20" : `;
    code = code.replace(styleTarget, styleReplace);

    const iconTarget = `{news.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : news.status === "Rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}`;
    const iconReplace = `{news.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : news.status === "Published" ? <CheckCircle2 className="w-3 h-3" /> : news.status === "Rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}`;
    code = code.replace(iconTarget, iconReplace);

    fs.writeFileSync(filepath, code);
}

function patchTeacher(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    
    // 1. Change "Ready to Post" to "Approved"
    code = code.replace(/"Ready to Post"/g, '"Approved"');
    code = code.replace(/'Ready to Post'/g, "'Approved'");
    
    // 2. Add "Published" to STATUSES
    code = code.replace(
        'const STATUSES = ["All", "Draft", "Pending Approval", "Rejected", "Approved"];',
        'const STATUSES = ["All", "Draft", "Pending Approval", "Rejected", "Approved", "Published"];'
    );

    // 3. Update the audience text
    code = code.replace(
        '<span className="font-label text-xs uppercase tracking-wider font-bold">{news.audience}</span>',
        '<span className="font-label text-xs uppercase tracking-wider font-bold overflow-hidden line-clamp-1">{news.posted_to || news.audience}</span>'
    );
    
    // 4. Update Published styling
    const styleTarget = `news.status === "Approved" ? "bg-primary-container/20 text-primary border border-primary/20" : `;
    const styleReplace = `news.status === "Approved" ? "bg-primary-container/20 text-primary border border-primary/20" : \n                       news.status === "Published" ? "bg-secondary-container/20 text-secondary border border-secondary/20" : `;
    code = code.replace(styleTarget, styleReplace);

    const iconTarget = `{news.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : `;
    const iconReplace = `{news.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : \n                        news.status === "Published" ? <CheckCircle2 className="w-3 h-3" /> : `;
    code = code.replace(iconTarget, iconReplace);

    fs.writeFileSync(filepath, code);
}

patchPrincipal('src/pages/PrincipalNewsletters.tsx');
patchTeacher('src/pages/TeacherNewsletters.tsx');

function patchLayout(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    code = code.replace(/"Ready to Post"/g, '"Approved"');
    code = code.replace(/'Ready to Post'/g, "'Approved'");
    // also consider published notifications
    code = code.replace(/\['Approved', 'Pending Approval'\]/g, "['Approved', 'Pending Approval', 'Published']");
    fs.writeFileSync(filepath, code);
}
patchLayout('src/components/layout/MainLayout.tsx');

console.log("Updated statuses");
