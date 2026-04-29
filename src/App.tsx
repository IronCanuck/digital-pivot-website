import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CarePlansPage from './pages/CarePlansPage';
import AdminLogin from './admin/AdminLogin';
import AdminSignup from './admin/AdminSignup';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminContent from './admin/AdminContent';
import AdminPortfolio from './admin/AdminPortfolio';
import AdminTestimonials from './admin/AdminTestimonials';
import AdminFAQ from './admin/AdminFAQ';
import AdminBlog from './admin/AdminBlog';
import AdminMedia from './admin/AdminMedia';
import AdminContacts from './admin/AdminContacts';
import AdminWaitlist from './admin/AdminWaitlist';
import AdminForms from './admin/AdminForms';
import AdminFormSubmissions from './admin/AdminFormSubmissions';
import AdminSettings from './admin/AdminSettings';
import AdminPages from './admin/AdminPages';
import AdminInvites from './admin/AdminInvites';
import PageEditor from './admin/PageEditor';
import PageRenderer from './components/PageRenderer';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Site */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <PageRenderer slug="home" fallback={<HomePage />} />
            </PublicLayout>
          }
        />
        <Route
          path="/p/:slug"
          element={
            <PublicLayout>
              <PageRenderer />
            </PublicLayout>
          }
        />
        <Route
          path="/blog"
          element={
            <PublicLayout>
              <BlogPage />
            </PublicLayout>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PublicLayout>
              <BlogPostPage />
            </PublicLayout>
          }
        />
        {/* Hidden — noindex'd, only shared with existing clients via offboarding email */}
        <Route
          path="/care-plans"
          element={
            <PublicLayout>
              <CarePlansPage />
            </PublicLayout>
          }
        />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/pages/:id/edit" element={<PageEditor />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="faq" element={<AdminFAQ />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="waitlist" element={<AdminWaitlist />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="form-submissions" element={<AdminFormSubmissions />} />
          <Route path="invites" element={<AdminInvites />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
