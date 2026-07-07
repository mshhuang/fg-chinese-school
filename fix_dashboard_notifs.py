import re

with open('src/components/DashboardNotifications.tsx', 'r') as f:
    content = f.read()

# Replace: setUserRole(u.role || "");
# With: setUserRole(localStorage.getItem('current_role') || u.role || "");
content = content.replace('setUserRole(u.role || "");', "setUserRole(localStorage.getItem('current_role') || u.role || '');")

with open('src/components/DashboardNotifications.tsx', 'w') as f:
    f.write(content)
