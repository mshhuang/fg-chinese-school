import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const [searchQuery, setSearchQuery] = useState("");',
    'const [searchQuery, setSearchQuery] = useState("");\n  const [visibleCount, setVisibleCount] = useState(9);'
)

# Reset visibleCount on class change
content = content.replace(
    'setSearchQuery("");',
    'setSearchQuery("");\n    setVisibleCount(9);'
)

# And on search query change, we probably don't need to reset, but let's slice the array
replacement_map = """const filteredStudents = students.filter(s => s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.last_name.toLowerCase().includes(searchQuery.toLowerCase()));
                       {filteredStudents.slice(0, visibleCount).map(student => {"""

content = re.sub(
    r'\{students\.filter\(s => s\.first_name\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\| s\.last_name\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)\)\.map\(student => \{',
    replacement_map,
    content
)

content = content.replace(
    '{students.length > 0 && (',
    '{filteredStudents.length > visibleCount && ('
)

content = content.replace(
    '<button className="px-8 py-3 rounded-full border border-primary text-primary font-bold font-label hover:bg-primary hover:text-white transition-colors">',
    '<button onClick={() => setVisibleCount(prev => prev + 9)} className="px-8 py-3 rounded-full border border-primary text-primary font-bold font-label hover:bg-primary hover:text-white transition-colors">'
)


with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
