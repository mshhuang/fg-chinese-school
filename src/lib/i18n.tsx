import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'zh-CN' | 'zh-TW';

interface Translations {
  [key: string]: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}

const translations: Translations = {

  "Room": { en: "Room", 'zh-CN': "教室", 'zh-TW': "教室" },
  "TBD": { en: "TBD", 'zh-CN': "待定", 'zh-TW': "待定" },
  "Students": { en: "Students", 'zh-CN': "名学生", 'zh-TW': "名學生" },
  "Teaching Team": { en: "Teaching Team", 'zh-CN': "教学团队", 'zh-TW': "教學團隊" },
  "Lead:": { en: "Lead:", 'zh-CN': "主班老师:", 'zh-TW': "主班老師:" },
  "Co-teacher:": { en: "Co-teacher:", 'zh-CN': "配班老师:", 'zh-TW': "配班老師:" },
  "Management Tools": { en: "Management Tools", 'zh-CN': "管理工具", 'zh-TW': "管理工具" },
  "Track & view sheets": { en: "Track & view sheets", 'zh-CN': "跟踪和查看记录", 'zh-TW': "追蹤和查看記錄" },
  "Manage tasks": { en: "Manage tasks", 'zh-CN': "管理任务", 'zh-TW': "管理任務" },
  "Class Notes": { en: "Class Notes", 'zh-CN': "课堂笔记", 'zh-TW': "課堂筆記" },
  "Observations": { en: "Observations", 'zh-CN': "观察记录", 'zh-TW': "觀察記錄" },
  "Performance": { en: "Performance", 'zh-CN': "表现", 'zh-TW': "表現" },
  "Class metrics": { en: "Class metrics", 'zh-CN': "班级指标", 'zh-TW': "班級指標" },
  "Student Roster": { en: "Student Roster", 'zh-CN': "学生名单", 'zh-TW': "學生名單" },
  "Search students...": { en: "Search students...", 'zh-CN': "搜索学生...", 'zh-TW': "搜尋學生..." },
  "Load More Students": { en: "Load More Students", 'zh-CN': "加载更多学生", 'zh-TW': "載入更多學生" },
  "Present (In School)": { en: "Present (In School)", 'zh-CN': "出勤 (在校)", 'zh-TW': "出勤 (在校)" },
  "Checked Out (Left School)": { en: "Checked Out (Left School)", 'zh-CN': "已签退 (离校)", 'zh-TW': "已簽退 (離校)" },
  "Absent": { en: "Absent", 'zh-CN': "缺勤", 'zh-TW': "缺勤" },
  "Not Arrived": { en: "Not Arrived", 'zh-CN': "未到", 'zh-TW': "未到" },
  "Late": { en: "Late", 'zh-CN': "迟到", 'zh-TW': "遲到" },
  "Excused": { en: "Excused", 'zh-CN': "请假", 'zh-TW': "請假" },
  "arrived_at": { en: "{name} arrived at school at {time} on {date}", 'zh-CN': "{name} 在 {date} {time} 到校", 'zh-TW': "{name} 在 {date} {time} 到校" },
  "No Classes Assigned": { en: "No Classes Assigned", 'zh-CN': "未分配班级", 'zh-TW': "未分配班級" },
  "no_classes_assigned_desc": { en: "You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.", 'zh-CN': "您目前未被指定为任何班级的主班或配班老师。如果您认为这是一个错误，请联系管理部门。", 'zh-TW': "您目前未被指定為任何班級的主班或配班老師。如果您認為這是一個錯誤，請聯絡管理部門。" },
  "You": { en: "You", 'zh-CN': "你", 'zh-TW': "你" },
  "Manage homework and assignments for your classes.": { en: "Manage homework and assignments for your classes.", 'zh-CN': "管理班级的作业和任务。", 'zh-TW': "管理班級的作業和任務。" },
  "Select Class:": { en: "Select Class:", 'zh-CN': "选择班级:", 'zh-TW': "選擇班級:" },
  "All Classes": { en: "All Classes", 'zh-CN': "所有班级", 'zh-TW': "所有班級" },
  "Create Assignment": { en: "Create Assignment", 'zh-CN': "创建作业", 'zh-TW': "創建作業" },
  "Choose a class": { en: "Choose a class", 'zh-CN': "选择一个班级", 'zh-TW': "選擇一個班級" },
  "My Classes (Lead & Co-Teacher)": { en: "My Classes (Lead & Co-Teacher)", 'zh-CN': "我的班级 (主班和配班)", 'zh-TW': "我的班級 (主班和配班)" },
  "Other Classes": { en: "Other Classes", 'zh-CN': "其他班级", 'zh-TW': "其他班級" },
  "New Assignment": { en: "New Assignment", 'zh-CN': "新建作业", 'zh-TW': "新建作業" },
  "Cancel": { en: "Cancel", 'zh-CN': "取消", 'zh-TW': "取消" },
  "Edit Assignment": { en: "Edit Assignment", 'zh-CN': "编辑作业", 'zh-TW': "編輯作業" },
  "Create New Assignment": { en: "Create New Assignment", 'zh-CN': "创建新作业", 'zh-TW': "創建新作業" },
  "Title": { en: "Title", 'zh-CN': "标题", 'zh-TW': "標題" },
  "Create and manage broadcast communications.": { en: "Create and manage broadcast communications.", 'zh-CN': "创建和管理广播通信。", 'zh-TW': "創建和管理廣播通訊。" },
  "Read the latest updates from your school.": { en: "Read the latest updates from your school.", 'zh-CN': "阅读学校的最新动态。", 'zh-TW': "閱讀學校的最新動態。" },
  
  "Compose Announcement": { en: "Compose Announcement", 'zh-CN': "撰写公告", 'zh-TW': "撰寫公告" },
  "Everyone": { en: "Everyone", 'zh-CN': "所有人", 'zh-TW': "所有人" },
  "Specific roles": { en: "Specific roles", 'zh-CN': "特定角色", 'zh-TW': "特定角色" },
  "Specific classes": { en: "Specific classes", 'zh-CN': "特定班级", 'zh-TW': "特定班級" },
  "Specific users": { en: "Specific users", 'zh-CN': "特定用户", 'zh-TW': "特定用戶" },

  "School Calendar": { en: "School Calendar", 'zh-CN': "校历", 'zh-TW': "校曆" },
  "View upcoming events, holidays, and academic schedules.": { en: "View upcoming events, holidays, and academic schedules.", 'zh-CN': "查看即将举行的活动、假期和教学计划。", 'zh-TW': "查看即將舉行的活動、假期和教學計劃。" },
  "View upcoming events, shifts, and school activities.": { en: "View upcoming events, shifts, and school activities.", 'zh-CN': "查看即将举行的活动、班次和学校活动。", 'zh-TW': "查看即將舉行的活動、班次和學校活動。" },
  "Event Calendar": { en: "Event Calendar", 'zh-CN': "活动日历", 'zh-TW': "活動日曆" },
  "EVENTS": { en: "EVENTS", 'zh-CN': "活动", 'zh-TW': "活動" },
  "Upcoming": { en: "Upcoming", 'zh-CN': "即将到来", 'zh-TW': "即將到來" },
  "schedule": { en: "schedule", 'zh-CN': "日程", 'zh-TW': "日程" },
  "No upcoming events.": { en: "No upcoming events.", 'zh-CN': "没有即将举行的活动。", 'zh-TW': "沒有即將舉行的活動。" },

  "View your daily timetable and upcoming events.": { en: "View your daily timetable and upcoming events.", 'zh-CN': "查看您的每日时间表和即将举行的活动。", 'zh-TW': "查看您的每日時間表和即將舉行的活動。" },
  "MY SCHEDULE": { en: "MY SCHEDULE", 'zh-CN': "我的时间表", 'zh-TW': "我的時間表" },
  "UPCOMING": { en: "UPCOMING", 'zh-CN': "即将到来", 'zh-TW': "即將到來" },
  "No schedule image available.": { en: "No schedule image available.", 'zh-CN': "没有可用的时间表图像。", 'zh-TW': "沒有可用的時間表圖像。" },

  "Upcoming Events": { en: "Upcoming Events", 'zh-CN': "即将举行的活动", 'zh-TW': "即將舉行的活動" },

  "No events scheduled for this cosmic day.": { en: "No events scheduled for this cosmic day.", 'zh-CN': "这一天没有安排任何活动。", 'zh-TW': "這一天沒有安排任何活動。" },

  "Attendance Sheet": { en: "Attendance Sheet", 'zh-CN': "出勤表", 'zh-TW': "出勤表" },
  "Submit the student attendance by class for today's sessions.": { en: "Submit the student attendance by class for today's sessions.", 'zh-CN': "按班级提交今天课程的学生出勤情况。", 'zh-TW': "按班級提交今天課程的學生出勤情況。" },
  "Select a Class": { en: "Select a Class", 'zh-CN': "选择一个班级", 'zh-TW': "選擇一個班級" },
  "Student Name": { en: "Student Name", 'zh-CN': "学生姓名", 'zh-TW': "學生姓名" },
  "Building Status": { en: "Building Status", 'zh-CN': "在校状态", 'zh-TW': "在校狀態" },
  "Ready to Go Home": { en: "Ready to Go Home", 'zh-CN': "准备回家", 'zh-TW': "準備回家" },
  "Attendance": { en: "Attendance", 'zh-CN': "出勤", 'zh-TW': "出勤" },
  "Notes": { en: "Notes", 'zh-CN': "备注", 'zh-TW': "備註" },
  "Submit": { en: "Submit", 'zh-CN': "提交", 'zh-TW': "提交" },

  "Type": { en: "Type", 'zh-CN': "类型", 'zh-TW': "類型" },
  "Description (Optional)": { en: "Description (Optional)", 'zh-CN': "描述 (可选)", 'zh-TW': "描述 (可選)" },
  "Attachments": { en: "Attachments", 'zh-CN': "附件", 'zh-TW': "附件" },
  "Add File Attachment": { en: "Add File Attachment", 'zh-CN': "添加文件附件", 'zh-TW': "添加文件附件" },
  "Max size 2MB": { en: "Max size 2MB", 'zh-CN': "最大尺寸 2MB", 'zh-TW': "最大尺寸 2MB" },
  "Due Date": { en: "Due Date", 'zh-CN': "截止日期", 'zh-TW': "截止日期" },
  "Assign To Students": { en: "Assign To Students", 'zh-CN': "分配给学生", 'zh-TW': "分配給學生" },
  "Select All": { en: "Select All", 'zh-CN': "全选", 'zh-TW': "全選" },
  "Deselect All": { en: "Deselect All", 'zh-CN': "取消全选", 'zh-TW': "取消全選" },
  "Save Assignment": { en: "Save Assignment", 'zh-CN': "保存作业", 'zh-TW': "保存作業" },
  "Saving...": { en: "Saving...", 'zh-CN': "保存中...", 'zh-TW': "儲存中..." },

  "Active": { en: "Active", 'zh-CN': "活动", 'zh-TW': "活動" },
  "History": { en: "History", 'zh-CN': "历史记录", 'zh-TW': "歷史記錄" },
  "No active assignments.": { en: "No active assignments.", 'zh-CN': "没有活动的作业。", 'zh-TW': "沒有活動的作業。" },

  "No assignment history.": { en: "No assignment history.", 'zh-CN': "没有历史作业。", 'zh-TW': "沒有歷史作業。" },

  "Class Newsletters": { en: "Class Newsletters", 'zh-CN': "班级电子报", 'zh-TW': "班級電子報" },
  "Create newsletters and submit them for approval.": { en: "Create newsletters and submit them for approval.", 'zh-CN': "创建电子报并提交审批。", 'zh-TW': "創建電子報並提交審批。" },
  "Create Newsletter": { en: "Create Newsletter", 'zh-CN': "创建电子报", 'zh-TW': "創建電子報" },
  "All": { en: "All", 'zh-CN': "全部", 'zh-TW': "全部" },
  "Draft": { en: "Draft", 'zh-CN': "草稿", 'zh-TW': "草稿" },
  "Pending Approval": { en: "Pending Approval", 'zh-CN': "待审批", 'zh-TW': "待審批" },
  "Rejected": { en: "Rejected", 'zh-CN': "已拒绝", 'zh-TW': "已拒絕" },
  "Approved": { en: "Approved", 'zh-CN': "已批准", 'zh-TW': "已批准" },
  "Published": { en: "Published", 'zh-CN': "已发布", 'zh-TW': "已發布" },
  "Search newsletters...": { en: "Search newsletters...", 'zh-CN': "搜索电子报...", 'zh-TW': "搜索電子報..." },
  "No newsletters found": { en: "No newsletters found", 'zh-CN': "未找到电子报", 'zh-TW': "未找到電子報" },
  "No newsletters awaiting review": { en: "No newsletters awaiting review", 'zh-CN': "没有等待审核的电子报", 'zh-TW': "沒有等待審核的電子報" },

  "Review Newsletters": { en: "Review Newsletters", 'zh-CN': "审核电子报", 'zh-TW': "審核電子報" },
  "Approve or reject newsletters submitted by teachers.": { en: "Approve or reject newsletters submitted by teachers.", 'zh-CN': "批准或拒绝教师提交的电子报。", 'zh-TW': "批准或拒絕教師提交的電子報。" },
  "Search by title or author...": { en: "Search by title or author...", 'zh-CN': "按标题或作者搜索...", 'zh-TW': "按標題或作者搜索..." },

  "Search recent chats...": { en: "Search recent chats...", 'zh-CN': "搜索最近的聊天...", 'zh-TW': "搜尋最近的聊天..." },
  "No conversations found": { en: "No conversations found", 'zh-CN': "未找到对话", 'zh-TW': "未找到對話" },
  "Search for users above to start a new conversation.": { en: "Search for users above to start a new conversation.", 'zh-CN': "在上方搜索用户以开始新的对话。", 'zh-TW': "在上方搜尋用戶以開始新的對話。" },
  "Compose Message": { en: "Compose Message", 'zh-CN': "写信息", 'zh-TW': "撰寫訊息" },
  "Select a user below to start a conversation": { en: "Select a user below to start a conversation", 'zh-CN': "在下方选择用户以开始对话", 'zh-TW': "在下方選擇用戶以開始對話" },
  "Select Recipient": { en: "Select Recipient", 'zh-CN': "选择收件人", 'zh-TW': "選擇收件人" },
  "Select a user": { en: "Select a user", 'zh-CN': "选择用户", 'zh-TW': "選擇用戶" },

  "Choose a user...": { en: "Choose a user...", 'zh-CN': "选择一个用户...", 'zh-TW': "選擇一個用戶..." },

  "No users matched your search.": { en: "No users matched your search.", 'zh-CN': "没有用户符合您的搜索。", 'zh-TW': "沒有用戶符合您的搜尋。" },

  "You have": { en: "You have", 'zh-CN': "您有", 'zh-TW': "您有" },

  "Teacher ID Badge": { en: "Teacher ID Badge", 'zh-CN': "教师工作证", 'zh-TW': "教師工作證" },

  "My Information": { en: "My Information", 'zh-CN': "我的信息", 'zh-TW': "我的資訊" },
  "View and edit your personal details and contact information.": { en: "View and edit your personal details and contact information.", 'zh-CN': "查看和编辑您的个人详细信息和联系方式。", 'zh-TW': "查看和編輯您的個人詳細資訊和聯絡方式。" },
  "Personal Details": { en: "Personal Details", 'zh-CN': "个人资料", 'zh-TW': "個人資料" },
  "Username": { en: "Username", 'zh-CN': "用户名", 'zh-TW': "用戶名" },
  "Primary Phone": { en: "Primary Phone", 'zh-CN': "主要电话", 'zh-TW': "主要電話" },
  "Secondary Phone": { en: "Secondary Phone", 'zh-CN': "备用电话", 'zh-TW': "備用電話" },
  "Health & Emergency": { en: "Health & Emergency", 'zh-CN': "健康与紧急情况", 'zh-TW': "健康與緊急情況" },
  "None specified": { en: "None specified", 'zh-CN': "未指定", 'zh-TW': "未指定" },
  "Medical Conditions / Allergies": { en: "Medical Conditions / Allergies", 'zh-CN': "医疗状况 / 过敏", 'zh-TW': "醫療狀況 / 過敏" },
  "Account Security": { en: "Account Security", 'zh-CN': "账户安全", 'zh-TW': "帳戶安全" },
  "Keep your account secure by updating your password regularly.": { en: "Keep your account secure by updating your password regularly.", 'zh-CN': "定期更新密码以确保您的账户安全。", 'zh-TW': "定期更新密碼以確保您的帳戶安全。" },
  "Change Password": { en: "Change Password", 'zh-CN': "更改密码", 'zh-TW': "更改密碼" },

  "Homeroom Teacher": { en: "Homeroom Teacher", 'zh-CN': "主班老师", 'zh-TW': "班導師" },
  "Co-Teacher": { en: "Co-Teacher", 'zh-CN': "配班老师", 'zh-TW': "搭班老師" },
  "co-teacher classes.": { en: "co-teacher classes.", 'zh-CN': "个配班老师班级。", 'zh-TW': "個搭班老師班級。" },
  "homeroom classes and": { en: "homeroom classes and", 'zh-CN': "个主班老师班级和", 'zh-TW': "個班導師班級和" },
  "QR scanner": { en: "QR scanner", 'zh-CN': "二维码扫描器", 'zh-TW': "QR 掃描器" },
  "clock in": { en: "clock in", 'zh-CN': "打卡", 'zh-TW': "打卡" },
  "post photo": { en: "post photo", 'zh-CN': "发布照片", 'zh-TW': "發布照片" },
  "Photo Information": { en: "Photo Information", 'zh-CN': "照片信息", 'zh-TW': "照片資訊" },

  "Clock Out": { en: "Clock Out", 'zh-CN': "打卡下班", 'zh-TW': "打卡下班" },
  "Edit Photo Highlight": { en: "Edit Photo Highlight", 'zh-CN': "编辑照片", 'zh-TW': "編輯照片" },
  "Post Photo": { en: "Post Photo", 'zh-CN': "发布照片", 'zh-TW': "發布照片" },


  "messages": { en: "messages", 'zh-CN': "聊天室", 'zh-TW': "聊天室" },

  "Manage and collaborate on your curriculum via Google Docs or Slides.": { en: "Manage and collaborate on your curriculum via Google Docs or Slides.", 'zh-CN': "通过 Google Docs 或 Slides 管理并协作您的课程。", 'zh-TW': "透過 Google Docs 或 Slides 管理並協作您的課程。" },
  "Google Doc or Slide Link": { en: "Google Doc or Slide Link", 'zh-CN': "Google Doc or Slide 的链接", 'zh-TW': "Google Doc or Slide 的連結" },
  "Help": { en: "Help", 'zh-CN': "帮助", 'zh-TW': "幫助" },
  "Share a Google Doc or Slide link for administrators to view your curriculum.": { en: "Share a Google Doc or Slide link for administrators to view your curriculum.", 'zh-CN': "分享 Google Doc 或 Slide 链接，供管理员查看您的课程。", 'zh-TW': "分享 Google Doc 或 Slide 連結，供管理員查看您的課程。" },
"New Announcement": { en: "New Announcement", 'zh-CN': "新公告", 'zh-TW': "新公告" },
  "Targeted Roles": { en: "Targeted Roles", 'zh-CN': "目标角色", 'zh-TW': "目標角色" },
  "Targeted Classes": { en: "Targeted Classes", 'zh-CN': "目标班级", 'zh-TW': "目標班級" },
  "Targeted Users": { en: "Targeted Users", 'zh-CN': "目标用户", 'zh-TW': "目標用戶" },
  "All Audiences": { en: "All Audiences", 'zh-CN': "所有受众", 'zh-TW': "所有受眾" },
  "Search announcements...": { en: "Search announcements...", 'zh-CN': "搜索公告...", 'zh-TW': "搜尋公告..." },
  // Navigation
  "Dashboard": { en: "Dashboard", 'zh-CN': "总览", 'zh-TW': "總覽" },
  "Calendar": { en: "Calendar", 'zh-CN': "日历", 'zh-TW': "行事曆" },
  "Classes": { en: "Classes", 'zh-CN': "班级", 'zh-TW': "班級" },
  "Reports": { en: "Reports", 'zh-CN': "报告", 'zh-TW': "報告" },
  "My Lesson Plans": { en: "My Lesson Plans", 'zh-CN': "教案", 'zh-TW': "教案" },
  "Messages": { en: "Messages", 'zh-CN': "聊天室", 'zh-TW': "聊天室" },
  "Announcements": { en: "Announcements", 'zh-CN': "公告", 'zh-TW': "公告" },
  "Newsletters": { en: "Newsletters", 'zh-CN': "电子报", 'zh-TW': "電子報" },
  "Management": { en: "Management", 'zh-CN': "管理", 'zh-TW': "管理" },
  "Recent Activities": { en: "Recent Activities", 'zh-CN': "近期活动", 'zh-TW': "近期活動" },
  "My Profile": { en: "My Profile", 'zh-CN': "个人资料", 'zh-TW': "個人資料" },
  "My Classes Schedule": { en: "My Classes Schedule", 'zh-CN': "我的课表", 'zh-TW': "我的課表" },
  "Roster & Attendance": { en: "Roster & Attendance", 'zh-CN': "班级名单 & 出勤状态", 'zh-TW': "班級名單 & 出勤狀態" },
  "Assignments": { en: "Assignments", 'zh-CN': "作业", 'zh-TW': "作業" },
  "Announcement": { en: "Announcement", 'zh-CN': "公告", 'zh-TW': "公告" },
  "Newsletter": { en: "Newsletter", 'zh-CN': "电子报", 'zh-TW': "電子報" },
  "Message": { en: "Message", 'zh-CN': "消息", 'zh-TW': "訊息" },
  "My Profiles": { en: "My Profiles", 'zh-CN': "个人资料", 'zh-TW': "個人資料" },
  "Grades": { en: "Grades", 'zh-CN': "成绩", 'zh-TW': "成績" },
  "Schedule": { en: "Schedule", 'zh-CN': "日程", 'zh-TW': "日程" },
  "Schedule and Calendar": { en: "Schedule & Calendar", 'zh-CN': "日程与日历", 'zh-TW': "日程與行事曆" },
  "Clubs": { en: "Clubs", 'zh-CN': "俱乐部", 'zh-TW': "俱樂部" },
  "QR Scanner": { en: "QR Scanner", 'zh-CN': "扫码", 'zh-TW': "掃碼" },
  
  // Principal Dashboard
  "Here is what's happening at your school today.": { en: "Here is what's happening at your school today.", 'zh-CN': "这是您学校今天的情况。", 'zh-TW': "這是您學校今天的情況。" },
  "Quick Stats": { en: "Quick Stats", 'zh-CN': "快速统计", 'zh-TW': "快速統計" },
  "Total Students": { en: "Total Students", 'zh-CN': "学生总数", 'zh-TW': "學生總數" },
  "Active Classes": { en: "Active Classes", 'zh-CN': "现有班级", 'zh-TW': "現有班級" },
  "Absences Today": { en: "Absences Today", 'zh-CN': "今日缺勤", 'zh-TW': "今日缺勤" },
  "Attendance Overview": { en: "Attendance Overview", 'zh-CN': "考勤概览", 'zh-TW': "考勤概覽" },
  "Recent Activity": { en: "Recent Activity", 'zh-CN': "最近活动", 'zh-TW': "最近活動" },
  "Latest Announcements": { en: "Latest Announcements", 'zh-CN': "最新公告", 'zh-TW': "最新公告" },
  "View All": { en: "View All", 'zh-CN': "查看全部", 'zh-TW': "查看全部" },

    // Photo Carousel & Teacher Dashboard
  "Classroom Photo Highlights": { en: "Classroom Photo Highlights", 'zh-CN': "教室照片集锦", 'zh-TW': "教室照片集錦" },
  "Rotating Carousel": { en: "Rotating Carousel", 'zh-CN': "轮播图", 'zh-TW': "輪播圖" },
  "Classroom activities, student projects & more": { en: "Classroom activities, student projects & more", 'zh-CN': "课堂活动，学生项目及更多", 'zh-TW': "課堂活動，學生專案及更多" },
  "Select Specific Classes": { en: "Select Specific Classes", 'zh-CN': "选择特定班级", 'zh-TW': "選擇特定班級" },
  "selected": { en: "selected", 'zh-CN': "已选择", 'zh-TW': "已選擇" },
  "All Classes & Audience": { en: "All Classes & Audience", 'zh-CN': "所有班级和受众", 'zh-TW': "所有班級和受眾" },
  "Assigned Programs": { en: "Assigned Programs", 'zh-CN': "分配的课程", 'zh-TW': "分配的課程" },
  "Upload New Photo": { en: "Upload New Photo", 'zh-CN': "上传新照片", 'zh-TW': "上傳新照片" },
  "View full screen": { en: "View full screen", 'zh-CN': "全屏查看", 'zh-TW': "全螢幕查看" },
  "Upload Image": { en: "Upload Image", 'zh-CN': "上传图片", 'zh-TW': "上傳圖片" },
  "Upload Image (max 5MB, jpeg/png)": { en: "Upload Image (max 5MB, jpeg/png)", 'zh-CN': "上传图片 (最大5MB, jpeg/png)", 'zh-TW': "上傳图片 (最大5MB, jpeg/png)" },
  "Caption (Optional)": { en: "Caption (Optional)", 'zh-CN': "照片说明 (可选)", 'zh-TW': "照片說明 (可選)" },
  "Target Audience": { en: "Target Audience", 'zh-CN': "目标受众", 'zh-TW': "目標受眾" },
  "All Audience (Students & Parents)": { en: "All Audience (Students & Parents)", 'zh-CN': "所有受众 (学生和家长)", 'zh-TW': "所有受眾 (學生和家長)" },
  "Class (Students & Parents)": { en: "Class (Students & Parents)", 'zh-CN': "班级 (学生和家长)", 'zh-TW': "班級 (學生和家長)" },

    // Teacher Classes
  "Schedule TBD": { en: "Schedule TBD", 'zh-CN': "时间待定", 'zh-TW': "時間待定" },
  "Room TBD": { en: "Room TBD", 'zh-CN': "教室待定", 'zh-TW': "教室待定" },
  "Students Enrolled": { en: "Students Enrolled", 'zh-CN': "名已注册学生", 'zh-TW': "名已註冊學生" },
  "Assign Homework": { en: "Assign Homework", 'zh-CN': "布置作业", 'zh-TW': "指派作業" },
  "Search classes...": { en: "Search classes...", 'zh-CN': "搜索课程...", 'zh-TW': "搜尋課程..." },
  "School-wide Schedule": { en: "School-wide Schedule", 'zh-CN': "全校时间表", 'zh-TW': "全校時間表" },
  "View Full Size": { en: "View Full Size", 'zh-CN': "查看全尺寸", 'zh-TW': "查看全尺寸" },
  "No school-wide schedule uploaded yet.": { en: "No school-wide schedule uploaded yet.", 'zh-CN': "尚未上传全校时间表。", 'zh-TW': "尚未上傳全校時間表。" },

  "Manage your classes and students.": { en: "Manage your classes and students.", 'zh-CN': "管理您的班级和学生。", 'zh-TW': "管理您的班級和學生。" },
  "School Schedule": { en: "School Schedule", 'zh-CN': "学校作息时间表", 'zh-TW': "學校作息時間表" },
  "You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.": { en: "You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.", 'zh-CN': "您目前未被指定为任何班级的班主任或副班主任。如果您认为这是一个错误，请联系管理部门。", 'zh-TW': "您目前未被指定為任何班級的班主任或副班主任。如果您認為這是一個錯誤，請聯絡管理部門。" },

  // Dashboards & Common

  "Edit Profile": { en: "Edit Profile", 'zh-CN': "编辑资料", 'zh-TW': "編輯資料" },
  "Save Changes": { en: "Save Changes", 'zh-CN': "保存更改", 'zh-TW': "儲存變更" },
  "Phone": { en: "Phone", 'zh-CN': "电话", 'zh-TW': "電話" },
  "Address": { en: "Address", 'zh-CN': "地址", 'zh-TW': "地址" },
  "Email": { en: "Email", 'zh-CN': "邮箱", 'zh-TW': "電子郵件" },
  "First Name": { en: "First Name", 'zh-CN': "名字", 'zh-TW': "名字" },
  "Last Name": { en: "Last Name", 'zh-CN': "姓氏", 'zh-TW': "姓氏" },
  "Date of Birth": { en: "Date of Birth", 'zh-CN': "出生日期", 'zh-TW': "出生日期" },
  "Grade": { en: "Grade", 'zh-CN': "年级", 'zh-TW': "年級" },
  "Role": { en: "Role", 'zh-CN': "角色", 'zh-TW': "角色" },
  "School": { en: "School", 'zh-CN': "学校", 'zh-TW': "學校" },
  "Personal Information": { en: "Personal Information", 'zh-CN': "个人信息", 'zh-TW': "個人資訊" },
  "Contact Information": { en: "Contact Information", 'zh-CN': "联系信息", 'zh-TW': "聯絡資訊" },
  "Emergency Contact": { en: "Emergency Contact", 'zh-CN': "紧急联系人", 'zh-TW': "緊急聯絡人" },
  "Medical Info": { en: "Medical Info", 'zh-CN': "医疗信息", 'zh-TW': "醫療資訊" },
  "Save": { en: "Save", 'zh-CN': "保存", 'zh-TW': "儲存" },
  "Edit": { en: "Edit", 'zh-CN': "编辑", 'zh-TW': "編輯" },
  "Delete": { en: "Delete", 'zh-CN': "删除", 'zh-TW': "刪除" },
  "Add": { en: "Add", 'zh-CN': "添加", 'zh-TW': "新增" },
  "Search...": { en: "Search...", 'zh-CN': "搜索...", 'zh-TW': "搜尋..." },
  "Filter": { en: "Filter", 'zh-CN': "筛选", 'zh-TW': "篩選" },
  "Status": { en: "Status", 'zh-CN': "状态", 'zh-TW': "狀態" },
  "Date": { en: "Date", 'zh-CN': "日期", 'zh-TW': "日期" },
  "Time": { en: "Time", 'zh-CN': "时间", 'zh-TW': "時間" },
  "Location": { en: "Location", 'zh-CN': "地点", 'zh-TW': "地點" },
  "Description": { en: "Description", 'zh-CN': "描述", 'zh-TW': "描述" },
  "None": { en: "None", 'zh-CN': "无", 'zh-TW': "無" },
  "Send": { en: "Send", 'zh-CN': "发送", 'zh-TW': "發送" },
  "Reply": { en: "Reply", 'zh-CN': "回复", 'zh-TW': "回覆" },
  "Subject": { en: "Subject", 'zh-CN': "主题", 'zh-TW': "主旨" },


  "Homework": { en: "Homework", 'zh-CN': "家庭作业", 'zh-TW': "家庭作業" },
  "Due tomorrow": { en: "Due tomorrow", 'zh-CN': "明天到期", 'zh-TW': "明天到期" },
  "unread messages": { en: "unread messages", 'zh-CN': "条未读消息", 'zh-TW': "條未讀訊息" },
  "Today's Schedule": { en: "Today's Schedule", 'zh-CN': "今日日程", 'zh-TW': "今日日程" },
  "School Announcements": { en: "School Announcements", 'zh-CN': "学校公告", 'zh-TW': "學校公告" },
  "Read More": { en: "Read More", 'zh-CN': "阅读更多", 'zh-TW': "閱讀更多" },
  "Loading...": { en: "Loading...", 'zh-CN': "加载中...", 'zh-TW': "載入中..." },
  "Welcome back,": { en: "Welcome back,", 'zh-CN': "欢迎回来，", 'zh-TW': "歡迎回來，" },
  "Here's what's happening with your children today.": { en: "Here's what's happening with your children today.", 'zh-CN': "这是您孩子今天的情况。", 'zh-TW': "這是您孩子今天的情況。" },
  "Daily Snapshot": { en: "Daily Snapshot", 'zh-CN': "每日快照", 'zh-TW': "每日快照" },
  "Student ID Badge": { en: "Student ID Badge", 'zh-CN': "学生证", 'zh-TW': "學生證" },
  "Not Checked In": { en: "Not Checked In", 'zh-CN': "未签到", 'zh-TW': "未簽到" },

  "Good morning": { en: "Good morning", 'zh-CN': "早上好", 'zh-TW': "早安" },
  "Good afternoon": { en: "Good afternoon", 'zh-CN': "下午好", 'zh-TW': "午安" },
  "Good evening": { en: "Good evening", 'zh-CN': "晚上好", 'zh-TW': "晚安" },
  "Welcome back": { en: "Welcome back", 'zh-CN': "欢迎回来", 'zh-TW': "歡迎回來" },
  "Check-in QR Code": { en: "Check-in QR Code", 'zh-CN': "签到二维码", 'zh-TW': "簽到QR碼" },
  "Scan QR": { en: "Scan QR", 'zh-CN': "扫码", 'zh-TW': "掃碼" },
  "My Classes": { en: "My Classes", 'zh-CN': "我的班级", 'zh-TW': "我的班級" },
  "Latest Announcement": { en: "Latest Announcement", 'zh-CN': "最新公告", 'zh-TW': "最新公告" },
  "Recent Submissions": { en: "Recent Submissions", 'zh-CN': "最近提交", 'zh-TW': "最近提交" },
  "Clock In": { en: "Clock In", 'zh-CN': "打卡上班", 'zh-TW': "打卡上班" },
  "Active Clock-In Session Detected": { en: "Active Clock-In Session Detected", 'zh-CN': "检测到活跃的打卡记录", 'zh-TW': "檢測到活躍的打卡記錄" },
  "Clock Out Now": { en: "Clock Out Now", 'zh-CN': "立即下班打卡", 'zh-TW': "立即下班打卡" },
  "No classes assigned yet.": { en: "No classes assigned yet.", 'zh-CN': "暂未分配班级。", 'zh-TW': "暫未分配班級。" },

  // Layout specific
  "Language": { en: "Language", 'zh-CN': "语言", 'zh-TW': "語言" },
  "Logout": { en: "Logout", 'zh-CN': "登出", 'zh-TW': "登出" },
  "Switch Role": { en: "Switch Role", 'zh-CN': "切换角色", 'zh-TW': "切換角色" },
  "English": { en: "English", 'zh-CN': "英文", 'zh-TW': "英文" },
  "Simplified Chinese": { en: "Simplified Chinese", 'zh-CN': "简体中文", 'zh-TW': "簡體中文" },
  "Traditional Chinese": { en: "Traditional Chinese", 'zh-CN': "繁体中文", 'zh-TW': "繁體中文" },
  "Files": { en: "Files", 'zh-CN': "档案", 'zh-TW': "檔案" },

};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && ['en', 'zh-CN', 'zh-TW'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
