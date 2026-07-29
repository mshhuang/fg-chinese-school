const fs = require('fs');
let code = fs.readFileSync('src/components/DuplicateClockWarningModal.tsx', 'utf8');

const target1 = `const actionLabel = isCheckIn ? 'Clock In' : 'Clock Out';`;
const replace1 = `const actionLabel = isCheckIn ? 'Clock In' : (actionType === 'school_check_out' ? 'Ready to Go Home' : 'Clock Out');`;

const target2 = `{userName} was already {actionLabel.toLowerCase()}ned at {formatExistingTime(existingRecord?.created_at)}.`;
const replace2 = `{userName} was already {isCheckIn ? 'clocked in' : (actionType === 'school_check_out' ? 'marked ready to go home' : 'clocked out')} at {formatExistingTime(existingRecord?.created_at)}.`;

const target3 = `Would you like to change/update the {actionLabel.toLowerCase()} time for this record, or create a new entry?`;
const replace3 = `Would you like to change/update the {isCheckIn ? 'clock-in' : (actionType === 'school_check_out' ? 'ready-to-go-home' : 'clock-out')} time for this record, or create a new entry?`;

code = code.replace(target1, replace1).replace(target2, replace2).replace(target3, replace3);
fs.writeFileSync('src/components/DuplicateClockWarningModal.tsx', code);
console.log('done patching modal');
