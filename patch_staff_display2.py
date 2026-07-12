import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

replacement = """                             const userStr = localStorage.getItem("user");
                             if (userStr) {
                                try {
                                    const parsedUser = JSON.parse(userStr);
                                    if (id === parsedUser.id) {
                                       return `You (${parsedUser.first_name || ''} ${parsedUser.last_name || ''})`.trim();
                                    }
                                } catch (e) {}
                             }
                             return 'Unknown';"""

content = re.sub(
    r'const userStr = localStorage\.getItem\("user"\);\n\s*if \(userStr\) \{\n\s*try \{\n\s*const parsedUser = JSON\.parse\(userStr\);\n\s*if \(id === parsedUser\.id\) return "You";\n\s*\} catch \(e\) \{\}\n\s*\}\n\s*return \'Unknown\';',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
