const fs = require('fs');

const fixFile = (file) => {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(
        /\} else if \(data\[0\]\.action_type === 'school_check_out'\) \{\s+setCheckInStatus\('checked_out'\);\s+\} else \{/g,
        `} else if (data[0].action_type === 'school_check_out') {
            setCheckInStatus('checked_out');
            setCheckInTime(data[0].created_at);
        } else {`
    );
    fs.writeFileSync(file, code);
};

fixFile('src/pages/ParentPortal.tsx');
fixFile('src/pages/StudentPortal.tsx');
console.log('done fixing checkInTime setting');
