import re

with open('src/pages/PrincipalClasses.tsx', 'r') as f:
    content = f.read()

# Update users fetch to get roles
fetch_pattern = r"const \{ data: tData \} = await supabase.from\('users'\).select\('user_id, first_name, last_name'\)\.in\('user_id', userIds\);"
fetch_replacement = """const { data: tData } = await supabase.from('users').select('user_id, first_name, last_name, user_roles(roles(role_name))').in('user_id', userIds);"""
content = re.sub(fetch_pattern, fetch_replacement, content)

# Map isVolunteer
map_pattern = r"const filteredUsers = tData\.filter\(\(t: any\) => !\(t\.first_name === \"Youlin\" && t\.last_name === \"Venerable\"\)\);"
map_replacement = """const filteredUsers = tData.filter((t: any) => !(t.first_name === "Youlin" && t.last_name === "Venerable")).map((t: any) => ({
                 ...t,
                 isVolunteer: t.user_roles?.some((ur: any) => ur.roles?.role_name === 'Volunteer')
               }));"""
content = re.sub(map_pattern, map_replacement, content)

# Fix display logic in the list of co-teachers
list_pattern = r"\{ct \? formatTeacherName\(ct\.first_name, ct\.last_name\) : 'Unknown'\}"
list_replacement = """{ct ? (ct.isVolunteer ? `${ct.first_name || ''} ${ct.last_name || ''}`.trim() || 'Volunteer' : formatTeacherName(ct.first_name, ct.last_name)) : 'Unknown'}"""
content = re.sub(list_pattern, list_replacement, content)

# Fix display logic in the select options
option_pattern = r"\{formatTeacherName\(t\.first_name, t\.last_name\)\}</option>"
option_replacement = """{t.isVolunteer ? `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Volunteer' : formatTeacherName(t.first_name, t.last_name)}</option>"""
content = re.sub(option_pattern, option_replacement, content)

with open('src/pages/PrincipalClasses.tsx', 'w') as f:
    f.write(content)
