const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Remove the inline imports if they exist
serverCode = serverCode.replace("import crypto from 'crypto';\nimport fsSync from 'fs';", "");

// Add to top if not present
if (!serverCode.includes("import crypto from 'crypto';")) {
  serverCode = "import crypto from 'crypto';\nimport fsSync from 'fs';\n" + serverCode;
}

fs.writeFileSync('server.ts', serverCode);
