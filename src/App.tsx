/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
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
import TeacherAssignmentBoard from "./pages/TeacherAssignmentBoard";
import TeacherClasses from "./pages/TeacherClasses";
import ParentGrades from "./pages/ParentGrades";
import ParentSchedule from "./pages/ParentSchedule";
import StudentClubs from "./pages/StudentClubs";
import StudentSchedule from "./pages/StudentSchedule";
import StudentAssignments from "./pages/StudentAssignments";
import StudentAssignmentDetail from "./pages/StudentAssignmentDetail";
import Profile from "./pages/Profile";
import StudentMessages from "./pages/StudentMessages";
import StaffDashboard from "./pages/StaffDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import StaffAttendance from "./pages/StaffAttendance";
import AttendanceSheet from "./pages/AttendanceSheet";
import VolunteerAttendance from "./pages/VolunteerAttendance";
import StaffAvailability from "./pages/StaffAvailability";
import QRScanner from "./pages/QRScanner";
import QRCodeBadge from "./components/QRCodeBadge";
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
import SupportTickets from "./pages/SupportTickets";
import BuilderDatabase from "./pages/BuilderDatabase";
import PasswordReminderRequests from "./pages/PasswordReminderRequests";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/Terms";

import AdminSessions from "./pages/AdminSessions";
import AdminCalendar from "./pages/AdminCalendar";
import TeacherCalendar from "./pages/TeacherCalendar";
import StaffCalendar from "./pages/StaffCalendar";
import VolunteerCalendar from "./pages/VolunteerCalendar";
import AdminReports from "./pages/AdminReports";
import BuilderInternalMessages from "./pages/BuilderInternalMessages";
import SupportWidget from "./components/SupportWidget";

// Initialize Google Analytics if measurement ID is provided
// @ts-ignore
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    // Log pageview to Google Analytics
    if (GA_MEASUREMENT_ID) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search, title: document.title });
    }

    const userStr = localStorage.getItem('user');
    if (userStr && location.pathname !== '/') {
      logSystemEvent('info', `Visited page: ${location.pathname}`, { path: location.pathname });
    }
  }, [location.pathname, location.search]);
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
           <Route path="/admin/calendar" element={<AdminCalendar />} />
           <Route path="/admin/plans" element={<MyLessonPlans />} />
           <Route path="/admin/classes" element={<PrincipalClasses />} />
           <Route path="/admin/reports" element={<AdminReports />} />
           <Route path="/admin/messages" element={<PrincipalMessages />} />
           <Route path="/admin/announcements" element={<Announcements />} />
           <Route path="/admin/newsletters" element={<PrincipalNewsletters />} />
           <Route path="/admin/management" element={<PrincipalManagement />} />
           <Route path="/admin/activities" element={<Activities />} />
           
           {/* Teacher */}
           <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
           <Route path="/teacher/calendar" element={<TeacherCalendar />} />
           <Route path="/teacher/classes" element={<TeacherClasses />} />
           <Route path="/teacher/attendance" element={<StaffAttendance />} />
           <Route path="/teacher/attendance-sheet" element={<AttendanceSheet />} />
           <Route path="/teacher/scanner" element={<QRScanner />} />
           <Route path="/teacher/lessons" element={<MyLessonPlans />} />
           <Route path="/teacher/messages" element={<PrincipalMessages />} />
           <Route path="/teacher/announcements" element={<Announcements />} />
           <Route path="/teacher/newsletters" element={<TeacherNewsletters />} />
           <Route path="/teacher/assignments" element={<TeacherAssignmentBoard />} />
           
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
           <Route path="/student/assignments/:id" element={<StudentAssignmentDetail />} />
           <Route path="/student/schedule" element={<StudentSchedule />} />
           <Route path="/student/clubs" element={<StudentClubs />} />
           
           {/* Staff */}
           <Route path="/staff/dashboard" element={<StaffDashboard />} />
           <Route path="/staff/calendar" element={<StaffCalendar />} />
           <Route path="/staff/attendance" element={<VolunteerAttendance />} />
           <Route path="/staff/availability" element={<StaffAvailability />} />
           <Route path="/staff/scanner" element={<QRScanner />} />
           <Route path="/staff/messages" element={<StaffMessages />} />
           <Route path="/staff/announcements" element={<Announcements />} />
           <Route path="/staff/new-user" element={<AdminNewUser />} />

           {/* Volunteer */}
           <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
           <Route path="/volunteer/calendar" element={<VolunteerCalendar />} />
           <Route path="/volunteer/attendance" element={<VolunteerAttendance />} />
           <Route path="/volunteer/enter-attendance" element={<StaffAttendance />} />
           <Route path="/volunteer/availability" element={<StaffAvailability />} />
           <Route path="/volunteer/scanner" element={<QRScanner />} />
           <Route path="/volunteer/messages" element={<StaffMessages />} />
           <Route path="/volunteer/announcements" element={<Announcements />} />

           {/* Builder (formerly Admin) */}
           <Route path="/builder/dashboard" element={<BuilderDashboard />} />
           <Route path="/builder/calendar" element={<AdminCalendar />} />
           <Route path="/builder/messages" element={<PrincipalMessages />} />
           <Route path="/builder/announcements" element={<Announcements />} />
           <Route path="/builder/users" element={<AdminUsers />} />
           <Route path="/builder/management" element={<PrincipalManagement />} />
           <Route path="/builder/classes" element={<PrincipalClasses />} />
           <Route path="/builder/new-user" element={<AdminNewUser />} />
           <Route path="/builder/settings" element={<div className="p-8"><h1 className="font-display text-3xl">Settings</h1></div>} />
           <Route path="/builder/system-logs" element={<Diagnostics />} />
           <Route path="/builder/sessions" element={<AdminSessions />} />
           <Route path="/builder/activities" element={<Activities />} />
           <Route path="/builder/audit-logs" element={<AuditLogs />} />
           <Route path="/builder/error-logs" element={<LiveErrorLogs />} />
           <Route path="/builder/support-tickets" element={<SupportTickets />} />
           <Route path="/builder/database" element={<BuilderDatabase />} />
           <Route path="/builder/password-reminders" element={<PasswordReminderRequests />} />
           <Route path="/builder/internal-messages" element={<BuilderInternalMessages />} />

           {/* Shared utility routes */}
           <Route path="/change-password" element={<ChangePassword />} />
           <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <SupportWidget />
    </BrowserRouter>
  );
}
