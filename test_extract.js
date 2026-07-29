function extractPlainText(htmlContent) {
  if (!htmlContent) return '';
  let str = htmlContent;
  
  // Strip role markers
  str = str.replace(/\$\$_role:\s*(.*?)\s*(?:_\$\$|\$\$)\s*/is, '');

  // Strip system markers
  str = str.replace(/\$\$_is_system:true_\$\$\s*/is, '');
  str = str.replace(/\$\$_is_system:true\$\$\s*/is, '');

  // Strip attachments block completely from plain text
  const subAttachIdx = str.indexOf('---SUBMISSION_ATTACHMENTS---');
  if (subAttachIdx !== -1) {
    str = str.substring(0, subAttachIdx);
  }

  const attachIdx = str.indexOf('---ATTACHMENTS---');
  if (attachIdx !== -1) {
    str = str.substring(0, attachIdx);
  }

  // Strip HTML tags
  str = str.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  str = str.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  // Condense spaces
  return str.replace(/\s+/g, ' ').trim();
}

console.log(extractPlainText(`$$_role:admin_$$<p>Mercury Week 3 Newsletter</p>\n\n---ATTACHMENTS---\n[{"name":"mercury 3.pdf","url":"https://xfftjqefsirzfemmklku.supabase.co/storage/v1/object/public/announcements/announcements/1785355381034_bqjak_mercury3.pdf"}]`));

