import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

# I will replace everything between `<div className="flex flex-wrap gap-4 mb-8">` and `</>  )}`

replacement = """                    <div className="flex flex-wrap gap-4 mb-8 w-full">
                       {(() => {
                          const filteredStudents = students.filter(s => s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.last_name.toLowerCase().includes(searchQuery.toLowerCase()));
                          return (
                            <>
                              {filteredStudents.slice(0, visibleCount).map(student => {
                                 const status = attendance[student.student_id] || 'Present';
                                 const isPresent = status === 'Present';
                                 
                                 return (
                                   <div key={student.student_id} className="flex-1 min-w-[300px] max-w-[380px] bg-white border border-primary/50 rounded-full p-2.5 flex items-center justify-between hover:shadow-md hover:border-primary transition-all cursor-pointer group">
                                      <div className="flex items-center gap-5">
                                         <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-[3px] border-primary/50 shrink-0 p-0.5">
                                            {student.avatar_url ? (
                                               <img src={student.avatar_url} alt={student.first_name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                               <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-xl rounded-full bg-surface">
                                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                               </div>
                                            )}
                                         </div>
                                         <div className="flex flex-col justify-center">
                                            <span className="font-bold text-on-surface text-lg group-hover:text-primary transition-colors">
                                               {student.first_name} {student.last_name}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                              <div className={`w-2 h-2 rounded-full ${isPresent ? 'bg-primary' : 'bg-error'}`} />
                                              <span className="font-label text-sm text-on-surface-variant">{status}</span>
                                            </div>
                                         </div>
                                      </div>
                                      <button className="w-10 h-10 rounded-full border border-primary/50 flex items-center justify-center mr-3 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                         <ChevronRight className="w-5 h-5" />
                                       </button>
                                   </div>
                                 );
                              })}
                              
                              {filteredStudents.length > visibleCount && (
                                <div className="flex justify-center mt-4 w-full">
                                   <button onClick={() => setVisibleCount(prev => prev + 9)} className="px-8 py-3 rounded-full border border-primary text-primary font-bold font-label hover:bg-primary hover:text-white transition-colors">
                                      Load More Students
                                   </button>
                                </div>
                              )}
                            </>
                          );
                       })()}
                    </div>
                  </>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}"""

content = re.sub(
    r'<div className="flex flex-wrap gap-4 mb-8">.*?</>\n               \)\}\n            </div>\n          </div>\n        \)\}\n      </div>\n    </div>\n  \);\n\}',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
