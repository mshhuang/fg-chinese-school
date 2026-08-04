const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherClasses.tsx', 'utf8');

if (!code.includes('useLanguage')) {
  code = code.replace(
    /import React, \{([^}]+)\} from 'react';/,
    `import React, { $1 } from 'react';\nimport { useLanguage } from '../lib/i18n';`
  );
}
if (!code.includes('const { t } = useLanguage();')) {
  code = code.replace(
    /export default function TeacherClasses\(\) \{/,
    `$&
  const { t } = useLanguage();`
  );
}

// Replacements
code = code.replace(
  />Classes<\/h1>/g,
  '>{t("Classes")}</h1>'
);
code = code.replace(
  />Manage your classes and students\.<\/p>/g,
  '>{t("Manage your classes and students.")}</p>'
);
code = code.replace(
  />\s*My Classes\s*<\/button>/g,
  '>\n                {t("My Classes")}\n             </button>'
);
code = code.replace(
  />\s*All Classes\s*<\/button>/g,
  '>\n                {t("All Classes")}\n             </button>'
);
code = code.replace(
  />\s*School Schedule\s*<\/button>/g,
  '>\n                {t("School Schedule")}\n             </button>'
);
code = code.replace(
  />No Classes Assigned<\/p>/g,
  '>{t("No Classes Assigned")}</p>'
);
code = code.replace(
  />You are not currently assigned as a primary or co-teacher for any classes\. If you believe this is an error, please contact the administration\.<\/p>/g,
  '>{t("You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.")}</p>'
);

fs.writeFileSync('src/pages/TeacherClasses.tsx', code);

// i18n translations
let i18nCode = fs.readFileSync('src/lib/i18n.tsx', 'utf8');

const classTranslations = `  // Teacher Classes
  "Manage your classes and students.": { en: "Manage your classes and students.", 'zh-CN': "管理您的班级和学生。", 'zh-TW': "管理您的班級和學生。" },
  "All Classes": { en: "All Classes", 'zh-CN': "所有班级", 'zh-TW': "所有班級" },
  "School Schedule": { en: "School Schedule", 'zh-CN': "学校作息时间表", 'zh-TW': "學校作息時間表" },
  "No Classes Assigned": { en: "No Classes Assigned", 'zh-CN': "未分配班级", 'zh-TW': "未分配班級" },
  "You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.": { en: "You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.", 'zh-CN': "您目前未被指定为任何班级的班主任或副班主任。如果您认为这是一个错误，请联系管理部门。", 'zh-TW': "您目前未被指定為任何班級的班主任或副班主任。如果您認為這是一個錯誤，請聯絡管理部門。" },

  // Dashboards & Common`;

i18nCode = i18nCode.replace('// Dashboards & Common', classTranslations);

fs.writeFileSync('src/lib/i18n.tsx', i18nCode);

