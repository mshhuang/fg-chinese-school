const fs = require('fs');

function restick(file) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      'className="flex p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl w-full md:w-fit border border-outline-variant/30 shadow-sm overflow-x-auto hide-scrollbar shrink-0"',
      'className="sticky top-[56px] z-30 flex p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl w-full md:w-fit border border-outline-variant/30 shadow-sm overflow-x-auto hide-scrollbar shrink-0"'
    );
    fs.writeFileSync(file, content);
  }
}

restick('src/pages/AdminDataEntry.tsx');
restick('src/pages/AdminAcademic.tsx');
restick('src/pages/AdminContent.tsx');
restick('src/pages/AdminUsers.tsx');
