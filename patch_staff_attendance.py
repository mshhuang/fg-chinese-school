import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

# Add import useLanguage
content = content.replace('import { cn, formatTeacherName } from "../lib/utils";', 'import { cn, formatTeacherName } from "../lib/utils";\nimport { useLanguage } from "../lib/i18n";')

# Add const { t } = useLanguage();
content = content.replace('const location = useLocation();', 'const location = useLocation();\n  const { t } = useLanguage();')

# Replace texts
content = content.replace('Room {selectedClass.room_number || "TBD"}', "{t('Room')} {selectedClass.room_number || t('TBD')}")
content = content.replace('{students.length} Students', "{students.length} {t('Students')}")
content = content.replace('<span className="font-bold text-primary">Teaching Team</span>', '<span className="font-bold text-primary">{t(\'Teaching Team\')}</span>')
content = content.replace('<span className="font-bold text-on-surface-variant">Lead:</span>', '<span className="font-bold text-on-surface-variant">{t(\'Lead:\')}</span>')
content = content.replace('<span className="font-bold text-on-surface-variant">Co-Teacher:</span>', '<span className="font-bold text-on-surface-variant">{t(\'Co-teacher:\')}</span>')
content = content.replace('Management Tools\n               </div>', "{t('Management Tools')}\n               </div>")
content = content.replace('title="Attendance" \n                    subtitle="Track & View Sheets"', "title={t('Attendance')} \n                    subtitle={t('Track & view sheets')}")
content = content.replace('title="Assignments" \n                    subtitle="Manage Tasks"', "title={t('Assignments')} \n                    subtitle={t('Manage tasks')}")
content = content.replace('title="Class Notes" \n                    subtitle="Observations"', "title={t('Class Notes')} \n                    subtitle={t('Observations')}")
content = content.replace('title="Performance" \n                    subtitle="Class Metrics"', "title={t('Performance')} \n                    subtitle={t('Class metrics')}")
content = content.replace('Student Roster\n                  </div>', "{t('Student Roster')}\n                  </div>")
content = content.replace('placeholder="Search students..."', "placeholder={t('Search students...')}")
content = content.replace('Load More Students\n                                   </button>', "{t('Load More Students')}\n                                   </button>")

# "You (" -> "{t('You')} ("
content = content.replace('`You (${formatTeacherName(parsedUser.first_name, parsedUser.last_name, "Teacher")})`', '`${t(\'You\')} (${formatTeacherName(parsedUser.first_name, parsedUser.last_name, "Teacher")})`')

# Statuses inside displayStatus logic
content = content.replace("displayStatus = 'Present (In School)';", "displayStatus = t('Present (In School)');")
content = content.replace("displayStatus = 'Checked Out (Left School)';", "displayStatus = t('Checked Out (Left School)');")
content = content.replace("displayStatus = 'Absent';", "displayStatus = t('Absent');")
content = content.replace("displayStatus = 'Not Arrived';", "displayStatus = t('Not Arrived');")
content = content.replace("displayStatus = 'Late';", "displayStatus = t('Late');")
content = content.replace("displayStatus = 'Excused';", "displayStatus = t('Excused');")
content = content.replace("displayStatus = `${student.first_name} arrived at school at ${timeStr} on ${dateStr}`;", "displayStatus = t('arrived_at').replace('{name}', student.first_name).replace('{time}', timeStr).replace('{date}', dateStr);")

# Empty states
content = content.replace('No Classes Assigned', "{t('No Classes Assigned')}")
content = content.replace('You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.', "{t('no_classes_assigned_desc')}")

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
