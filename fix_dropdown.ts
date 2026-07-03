const desiredOrder = ['Admin', 'Teacher', 'Student', 'Parent', 'Volunteer', 'Staff', 'Builder'];

function getPrimaryRole(roles) {
    if (!roles || roles.length === 0) return 'Others';
    let bestIdx = 999;
    let bestRole = 'Others';
    for (const r of roles) {
        const idx = desiredOrder.indexOf(r);
        if (idx !== -1 && idx < bestIdx) {
            bestIdx = idx;
            bestRole = r;
        }
    }
    if (bestIdx === 999) return roles[0]; // fallback
    return bestRole;
}

console.log("Vickie primary role:", getPrimaryRole(['Teacher', 'Builder', 'Parent']));
