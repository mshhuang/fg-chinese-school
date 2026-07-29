const displayContent = `$$_role:admin_$$<p>Mercury Week 3 Newsletter</p>\n\n---ATTACHMENTS---\n[{"name":"mercury 3.pdf","url":"https://xfftjqefsirzfemmklku.supabase.co/storage/v1/object/public/announcements/announcements/1785355381034_bqjak_mercury3.pdf"}]`;
const roleMatch = displayContent.match(/^\$\$_role:([^_]+)_\$\$(.*)/s);
console.log("roleMatch:", !!roleMatch);
if(roleMatch) {
   let text = roleMatch[2];
   const attachMatch = text.match(/\n*---ATTACHMENTS---\n*([\s\S]*)/);
   console.log("attachMatch:", !!attachMatch);
   if(attachMatch) {
       console.log("text before attach:", text.substring(0, attachMatch.index));
       console.log("attachments:", attachMatch[1]);
   }
}
