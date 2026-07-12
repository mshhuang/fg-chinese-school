import fs from 'fs';
const content = fs.readFileSync('src/pages/TeacherDashboard.tsx', 'utf8');

const divOpens = (content.match(/<div(\s|>)/g) || []).length;
const divCloses = (content.match(/<\/div>/g) || []).length;
console.log('divs:', divOpens, divCloses);

const sectionOpens = (content.match(/<section(\s|>)/g) || []).length;
const sectionCloses = (content.match(/<\/section>/g) || []).length;
console.log('sections:', sectionOpens, sectionCloses);

const asideOpens = (content.match(/<aside(\s|>)/g) || []).length;
const asideCloses = (content.match(/<\/aside>/g) || []).length;
console.log('aside:', asideOpens, asideCloses);

