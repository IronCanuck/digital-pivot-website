import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, FileText, Briefcase, Star, HelpCircle, SquarePen as PenSquare, Image, Inbox, Settings, LogOut, Menu, X, ChevronRight, FormInput, ClipboardList, Users, Layout, Mail, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  badgeKey?: 'unreadNotifications';
}[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell, badgeKey: 'unreadNotifications' },
  { to: '/admin/pages', label: 'Pages (Builder)', icon: Layout },
  { to: '/admin/content', label: 'Page Content', icon: FileText },
  { to: '/admin/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/admin/blog', label: 'Blog Posts', icon: PenSquare },
  { to: '/admin/media', label: 'Media Logos', icon: Image },
  { to: '/admin/contacts', label: 'Contact Inbox', icon: Inbox },
  { to: '/admin/waitlist', label: 'Waitlist', icon: Users },
  { to: '/admin/forms', label: 'Form Builder', icon: FormInput },
  { to: '/admin/form-submissions', label: 'Form Submissions', icon: ClipboardList },
  { to: '/admin/invites', label: 'Admin Invites', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const refresh = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null);
      if (!cancelled) setUnreadCount(count ?? 0);
    };
    refresh();
    const channel = supabase
      .channel('notifications-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        refresh,
      )
      .subscribe();
    const interval = setInterval(refresh, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const badges: Record<'unreadNotifications', number> = {
    unreadNotifications: unreadCount,
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-950 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">
              Digital<span className="text-teal-400">Pivot</span>
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-1 ml-10">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end, badgeKey }) => {
            const badgeValue = badgeKey ? badges[badgeKey] : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-brand text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <span className="relative shrink-0">
                  <Icon className="w-4 h-4" />
                  {badgeValue > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-gray-950" />
                  )}
                </span>
                <span className="flex-1 truncate">{label}</span>
                {badgeValue > 0 ? (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {badgeValue > 99 ? '99+' : badgeValue}
                  </span>
                ) : (
                  <ChevronRight className="w-3 h-3 ml-auto opacity-30" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center justify-between px-3">
            <div>
              <p className="text-white text-xs font-medium truncate max-w-[140px]">{user?.email}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
          <span className="font-display font-bold text-gray-900">Admin Panel</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-600 font-medium hover:underline"
          >
            View Site
          </a>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
