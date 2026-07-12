import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const filteredStudents = students.filter(s => s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.last_name.toLowerCase().includes(searchQuery.toLowerCase()));',
    '{(() => {\n                          const filteredStudents = students.filter(s => s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.last_name.toLowerCase().includes(searchQuery.toLowerCase()));\n                          return (\n                            <>\n                              {filteredStudents.slice(0, visibleCount).map(student => {'
)

content = content.replace(
    '''                    {filteredStudents.length > visibleCount && (
                      <div className="flex justify-center mt-4">
                         <button onClick={() => setVisibleCount(prev => prev + 9)} className="px-8 py-3 rounded-full border border-primary text-primary font-bold font-label hover:bg-primary hover:text-white transition-colors">
                            Load More Students
                         </button>
                      </div>
                    )}''',
    '''                    {filteredStudents.length > visibleCount && (
                      <div className="flex justify-center mt-4 w-full">
                         <button onClick={() => setVisibleCount(prev => prev + 9)} className="px-8 py-3 rounded-full border border-primary text-primary font-bold font-label hover:bg-primary hover:text-white transition-colors">
                            Load More Students
                         </button>
                      </div>
                    )}
                            </>
                          );
                       })()}'''
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
