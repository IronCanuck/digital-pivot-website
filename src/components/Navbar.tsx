import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Our Process', href: '/#process' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm py-3' : 'bg-white/90 backdrop-blur-sm py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">
              Digital<span className="text-teal-400">Pivot</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-500"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/#contact"
              className="px-5 py-2 rounded-full bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              Apply to Waitlist
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-700 font-medium text-sm hover:text-teal-500 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/#contact"
            className="mt-2 text-center px-5 py-2.5 rounded-full bg-gradient-brand text-white text-sm font-semibold"
          >
            Apply to Waitlist
          </a>
        </div>
      </div>
    </header>
  );
}
