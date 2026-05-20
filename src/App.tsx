import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Announcements from "./pages/Announcements";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import CalendarPage from "./pages/CalendarPage";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import More from "./pages/More";
import LunchInfo from "./pages/LunchInfo";
import StudentLeave from "./pages/StudentLeave";
import ContactSchool from "./pages/ContactSchool";
import SchoolIntro from "./pages/SchoolIntro";
import Location from "./pages/Location";
import FormDownload from "./pages/FormDownload";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminLunch from "./pages/admin/AdminLunch";
import AdminAlbums from "./pages/admin/AdminAlbums";
import AdminSchoolInfo from "./pages/admin/AdminSchoolInfo";
import AdminForms from "./pages/admin/AdminForms";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/announcements/:id" element={<AnnouncementDetail />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/more" element={<More />} />
            <Route path="/lunch" element={<LunchInfo />} />
            <Route path="/leave" element={<StudentLeave />} />
            <Route path="/contact" element={<ContactSchool />} />
            <Route path="/school-intro" element={<SchoolIntro />} />
            <Route path="/location" element={<Location />} />
            <Route path="/forms" element={<FormDownload />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="lunch" element={<AdminLunch />} />
            <Route path="albums" element={<AdminAlbums />} />
            <Route path="school" element={<AdminSchoolInfo />} />
            <Route path="forms" element={<AdminForms />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
