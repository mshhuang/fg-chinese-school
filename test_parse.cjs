const row = { content: '{"content":"","audience":"Parents","status":"Pending Approval","date":"16/07/2026","author":"Derek Chen","pdfData":"https://...","pdfName":"WEEKLY NEWS 2 2026.pdf","adminComment":null}' };

let activeTab = 'newsletters';

function extractPlainText(str) { return str; }

let result = (() => {
   if (activeTab === 'newsletters') {
       try {
           const parsed = JSON.parse(row.content || "{}");
           return extractPlainText(parsed.content || parsed.pdfName || row.content);
       } catch (e) {
           return extractPlainText(row.content);
       }
   }
   return extractPlainText(row.content);
})();

console.log("Result:", result);
