/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { logSystemEvent } from "./lib/logSystemEvent";
import Login from "./pages/Login";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import StudentPortal from "./pages/StudentPortal";
import ParentPortal from "./pages/ParentPortal";
import MyLessonPlans from "./pages/MyLessonPlans";
import MainLayout from "./components/layout/MainLayout";
import TeacherDashboard from "./pages/TeacherDashboard";
import Diagnostics from "./pages/Diagnostics";
import PrincipalMessages from "./pages/PrincipalMessages";
import PrincipalClasses from "./pages/PrincipalClasses";
import Announcements from "./pages/Announcements";
import PrincipalNewsletters from "./pages/PrincipalNewsletters";
import TeacherNewsletters from "./pages/TeacherNewsletters";
import TeacherTasks from "./pages/TeacherTasks";
import TeacherClasses from "./pages/TeacherClasses";
import ParentGrades from "./pages/ParentGrades";
import ParentSchedule from "./pages/ParentSchedule";
import StudentClubs from "./pages/StudentClubs";
import StudentSchedule from "./pages/StudentSchedule";
import StudentAssignments from "./pages/StudentAssignments";
import Profile from "./pages/Profile";
import StudentMessages from "./pages/StudentMessages";
import StaffDashboard from "./pages/StaffDashboard";
import StaffAttendance from "./pages/StaffAttendance";
import StaffAvailability from "./pages/StaffAvailability";
import StaffMessages from "./pages/StaffMessages";
import AdminAcademic from "./pages/AdminAcademic";
import Activities from "./pages/Activities";
import AdminContent from "./pages/AdminContent";
import PrincipalManagement from "./pages/PrincipalManagement";
import AdminNewUser from "./pages/AdminNewUser";
import AdminDataEntry from "./pages/AdminDataEntry";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import BuilderDashboard from "./pages/BuilderDashboard";
import AuditLogs from "./pages/AuditLogs";
import ChangePassword from "./pages/ChangePassword";
import LiveErrorLogs from "./pages/LiveErrorLogs";
import BuilderDatabase from "./pages/BuilderDatabase";
import PasswordReminderRequests from "./pages/PasswordReminderRequests";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/Terms";

import AdminSessions from "./pages/AdminSessions";

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && location.pathname !== '/') {
      logSystemEvent('info', `Visited page: ${location.pathname}`, { path: location.pathname });
    }
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageTracker />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        {/* Layout for logged in views */}
        <Route element={<MainLayout />}>
           {/* Admin (formerly Principal) */}
           <Route path="/admin/dashboard" element={<PrincipalDashboard />} />
           <Route path="/admin/plans" element={<MyLessonPlans />} />
           <Route path="/admin/classes" element={<PrincipalClasses />} />
           <Route path="/admin/messages" element={<PrincipalMessages />} />
           <Route path="/admin/announcements" element={<Announcements />} />
           <Route path="/admin/newsletters" element={<PrincipalNewsletters />} />
           <Route path="/admin/management" element={<PrincipalManagement />} />
           <Route path="/admin/activities" element={<Activities />} />
           
           {/* Teacher */}
           <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
           <Route path="/teacher/classes" element={<TeacherClasses />} />
           <Route path="/teacher/lessons" element={<MyLessonPlans />} />
           <Route path="/teacher/messages" element={<PrincipalMessages />} />
           <Route path="/teacher/announcements" element={<Announcements />} />
           <Route path="/teacher/newsletters" element={<TeacherNewsletters />} />
           <Route path="/teacher/assignments" element={<TeacherTasks />} />
           
           {/* Parent */}
           <Route path="/parent/dashboard" element={<ParentPortal />} />
           <Route path="/parent/grades" element={<ParentGrades />} />
           <Route path="/parent/schedule" element={<ParentSchedule />} />
           <Route path="/parent/messages" element={<PrincipalMessages />} />
           <Route path="/parent/announcements" element={<Announcements />} />
           
           {/* Student */}
           <Route path="/student/dashboard" element={<StudentPortal />} />
           <Route path="/student/announcements" element={<Announcements />} />
           <Route path="/student/messages" element={<StudentMessages />} />
           <Route path="/student/profile" element={<Profile />} />
           <Route path="/student/assignments" element={<StudentAssignments />} />
           <Route path="/student/schedule" element={<StudentSchedule />} />
           <Route path="/student/clubs" element={<StudentClubs />} />
           
           {/* Staff & Volunteer */}
           <Route path="/staff/dashboard" element={<StaffDashboard />} />
           <Route path="/staff/attendance" element={<StaffAttendance />} />
           <Route path="/staff/availability" element={<StaffAvailability />} />
           <Route path="/staff/messages" element={<StaffMessages />} />
           <Route path="/staff/announcements" element={<Announcements />} />
           <Route path="/staff/new-user" element={<AdminNewUser />} />

           {/* Builder (formerly Admin) */}
           <Route path="/builder/dashboard" element={<BuilderDashboard />} />
           <Route path="/builder/messages" element={<PrincipalMessages />} />
           <Route path="/builder/announcements" element={<Announcements />} />
           <Route path="/builder/users" element={<AdminUsers />} />
           <Route path="/builder/new-user" element={<AdminNewUser />} />
           <Route path="/builder/settings" element={<div className="p-8"><h1 className="font-display text-3xl">Settings</h1></div>} />
           <Route path="/builder/system-logs" element={<Diagnostics />} />
           <Route path="/builder/sessions" element={<AdminSessions />} />
           <Route path="/builder/activities" element={<Activities />} />
           <Route path="/builder/audit-logs" element={<AuditLogs />} />
           <Route path="/builder/error-logs" element={<LiveErrorLogs />} />
           <Route path="/builder/database" element={<BuilderDatabase />} />
           <Route path="/builder/password-reminders" element={<PasswordReminderRequests />} />

           {/* Shared utility routes */}
           <Route path="/change-password" element={<ChangePassword />} />
           <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
