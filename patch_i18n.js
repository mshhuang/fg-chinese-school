const fs = require('fs');
let code = fs.readFileSync('src/lib/i18n.tsx', 'utf8');

const newTranslations = `  // Photo Carousel & Teacher Dashboard
  "Classroom Photo Highlights": { en: "Classroom Photo Highlights", 'zh-CN': "教室照片集锦", 'zh-TW': "教室照片集錦" },
  "Rotating Carousel": { en: "Rotating Carousel", 'zh-CN': "轮播图", 'zh-TW': "輪播圖" },
  "Classroom activities, student projects & more": { en: "Classroom activities, student projects & more", 'zh-CN': "课堂活动，学生项目及更多", 'zh-TW': "課堂活動，學生專案及更多" },
  "Select Specific Classes": { en: "Select Specific Classes", 'zh-CN': "选择特定班级", 'zh-TW': "選擇特定班級" },
  "selected": { en: "selected", 'zh-CN': "已选择", 'zh-TW': "已選擇" },
  "All Classes & Audience": { en: "All Classes & Audience", 'zh-CN': "所有班级和受众", 'zh-TW': "所有班級和受眾" },
  "Select All": { en: "Select All", 'zh-CN': "全选", 'zh-TW': "全選" },
  "Photo Information": { en: "Photo Information", 'zh-CN': "照片信息", 'zh-TW': "照片資訊" },
  "Assigned Programs": { en: "Assigned Programs", 'zh-CN': "分配的课程", 'zh-TW': "分配的課程" },
  "Upload New Photo": { en: "Upload New Photo", 'zh-CN': "上传新照片", 'zh-TW': "上傳新照片" },
  "View full screen": { en: "View full screen", 'zh-CN': "全屏查看", 'zh-TW': "全螢幕查看" },
  "Upload Image": { en: "Upload Image", 'zh-CN': "上传图片", 'zh-TW': "上傳圖片" },
  "Upload Image (max 5MB, jpeg/png)": { en: "Upload Image (max 5MB, jpeg/png)", 'zh-CN': "上传图片 (最大5MB, jpeg/png)", 'zh-TW': "上傳圖片 (最大5MB, jpeg/png)" },
  "Caption (Optional)": { en: "Caption (Optional)", 'zh-CN': "照片说明 (可选)", 'zh-TW': "照片說明 (可選)" },
  "Target Audience": { en: "Target Audience", 'zh-CN': "目标受众", 'zh-TW': "目標受眾" },
  "All Audience (Students & Parents)": { en: "All Audience (Students & Parents)", 'zh-CN': "所有受众 (学生和家长)", 'zh-TW': "所有受眾 (學生和家長)" },
  "Class (Students & Parents)": { en: "Class (Students & Parents)", 'zh-CN': "班级 (学生和家长)", 'zh-TW': "班級 (學生和家長)" },

  // Dashboards & Common`;

code = code.replace('// Dashboards & Common', newTranslations);

fs.writeFileSync('src/lib/i18n.tsx', code);
