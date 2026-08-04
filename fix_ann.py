with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

func = """
function getRealUserId(id: string | null | undefined) {
    if (!id) return id;
    if (id.startsWith('demo_')) return '9a5e12f8-0c6f-474c-836e-1d57f9202a6c';
    return id;
}

export async function fetchVisibleAnnouncements
"""

content = content.replace('export async function fetchVisibleAnnouncements', func.strip())

# Replace user.id with getRealUserId(user.id)
# BUT we need to make sure we replace the right ones. 
# actually, it's easier to just do:
# const realUserId = getRealUserId(user.id);
# and replace user.id with realUserId everywhere in the function!

content = content.replace("userRole = userRole || 'student';", "userRole = userRole || 'student';\n     const realUserId = getRealUserId(user.id);")
content = content.replace("user.id", "realUserId")

with open('src/lib/announcementUtils.ts', 'w') as f:
    f.write(content)
