const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherDashboard.tsx', 'utf8');

code = code.replace(
  />\s*Assigned Programs\s*<\/h3>/,
  '>{t("Assigned Programs")}</h3>'
);
// Make sure t is imported if not already, but it's already used for Good Morning, etc.

fs.writeFileSync('src/pages/TeacherDashboard.tsx', code);

code = fs.readFileSync('src/components/PhotoCarousel.tsx', 'utf8');

// I need to make sure `useLanguage` is imported in PhotoCarousel.tsx.
if (!code.includes('useLanguage')) {
  code = code.replace(
    /import React, \{([^}]+)\} from 'react';/,
    `import React, { $1 } from 'react';\nimport { useLanguage } from '../lib/i18n';`
  );
}
// Add const { t } = useLanguage(); inside PhotoCarousel component
if (!code.includes('const { t } = useLanguage();')) {
  code = code.replace(
    /export default function PhotoCarousel\([^)]*\) \{/,
    `$&
  const { t } = useLanguage();`
  );
}

// Replace texts
code = code.replace(/Classroom Photo Highlights/g, '{t("Classroom Photo Highlights")}');
code = code.replace(/Rotating Carousel/g, '{t("Rotating Carousel")}');
code = code.replace(/Classroom activities, student projects & more/g, '{t("Classroom activities, student projects & more")}');
code = code.replace(/>\s*Select Specific Classes \(/g, '>{t("Select Specific Classes")} (');
code = code.replace(/\) selected\):/g, ') {t("selected")}:');
code = code.replace(/>\s*All Classes & Audience\s*<\/option>/g, '>{t("All Classes & Audience")}</option>');
code = code.replace(/>\s*Select All\s*<\/button>/g, '>{t("Select All")}</button>');
code = code.replace(/>\s*Photo Information\s*<\/h3>/g, '>{t("Photo Information")}</h3>');
code = code.replace(/>\s*Upload New Photo\s*<\/h3>/g, '>{t("Upload New Photo")}</h3>');
code = code.replace(/>\s*View full screen\s*<\/span>/g, '>{t("View full screen")}</span>');
code = code.replace(/>\s*Upload Image\s*<\/h3>/g, '>{t("Upload Image")}</h3>');
code = code.replace(/>\s*Upload Image \(max 5MB, jpeg\/png\)\s*<\/span>/g, '>{t("Upload Image (max 5MB, jpeg/png)")}</span>');
code = code.replace(/>\s*Caption \(Optional\)\s*<\/label>/g, '>{t("Caption (Optional)")}</label>');
code = code.replace(/>\s*Target Audience\s*<\/label>/g, '>{t("Target Audience")}</label>');
code = code.replace(/>\s*All Audience \(Students & Parents\)\s*<\/span>/g, '>{t("All Audience (Students & Parents)")}</span>');
code = code.replace(/>\s*Class \(Students & Parents\)\s*<\/span>/g, '>{t("Class (Students & Parents)")}</span>');


fs.writeFileSync('src/components/PhotoCarousel.tsx', code);
