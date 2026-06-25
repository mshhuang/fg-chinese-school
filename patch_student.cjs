const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentAssignments.tsx', 'utf8');

const getStatusDisplayStr = `  const getStatusDisplay = (status: string, dueDateStr: string) => {
     let displayStatus = status || 'pending';
     if (displayStatus === 'pending' && dueDateStr) {
        const due = new Date(dueDateStr);
        if (due < new Date()) {
           displayStatus = 'late';
        }
     }
     return displayStatus;
  };`;

const filteredAssignmentsStr = `  const filteredAssignments = assignments.filter(a => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return a.status === "pending" || a.status === "late";
    if (activeTab === "completed") return a.status === "submitted";
    return true;
  });`;

const newFilteredStr = `  const filteredAssignments = assignments.filter(a => {
    const displayStatus = getStatusDisplay(a.status, a.assignments?.due_date);
    if (activeTab === "all") return true;
    if (activeTab === "pending") return displayStatus === "pending" || displayStatus === "late";
    if (activeTab === "completed") return displayStatus === "submitted" || displayStatus === "completed";
    return true;
  });`;

code = code.replace(getStatusDisplayStr, "");
code = code.replace(filteredAssignmentsStr, getStatusDisplayStr + "\n\n" + newFilteredStr);

fs.writeFileSync('src/pages/StudentAssignments.tsx', code);
