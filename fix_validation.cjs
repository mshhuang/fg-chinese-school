const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

content = content.replace(/<select required/g, '<select');
content = content.replace(/<input type="date" required/g, '<input type="date"');
content = content.replace(/<input type="number" required/g, '<input type="number"');

// update handleSubmit
const oldSubmit = `  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedParent || selectedChildren.length === 0) {
       alert("Please select a parent and at least one child.");
       return;
    }`;

const newSubmit = `  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("handleSubmit called. Details:", { selectedParent, selectedChildren, enrollmentDetails });
    if (!selectedParent || selectedChildren.length === 0) {
       alert("Please select a parent and at least one child.");
       return;
    }
    if (!enrollmentDetails.program) {
       alert("Please select a program.");
       return;
    }
    if (!enrollmentDetails.status) {
       alert("Please select a status.");
       return;
    }
    if (!enrollmentDetails.enrollment_date) {
       alert("Please select an enrollment date.");
       return;
    }`;

content = content.replace(oldSubmit, newSubmit);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
