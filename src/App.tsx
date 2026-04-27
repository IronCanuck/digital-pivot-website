import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminContent from './admin/AdminContent';
import AdminPortfolio from './admin/AdminPortfolio';
import AdminTestimonials from './admin/AdminTestimonials';
import AdminFAQ from './admin/AdminFAQ';
import AdminBlog from './admin/AdminBlog';
import AdminMedia from './admin/AdminMedia';
import AdminContacts from './admin/AdminContacts';
import AdminForms from './admin/AdminForms';
import AdminFormSubmissions from './admin/AdminFormSubmissions';
import AdminSettings from './admin/AdminSettings';

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
              <HomePage />
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

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="faq" element={<AdminFAQ />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="form-submissions" element={<AdminFormSubmissions />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
