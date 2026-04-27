import { Link } from 'react-router-dom';
import { Zap, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Digital<span className="text-teal-400">Pivot</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Professional websites for Canadian businesses. We design, build, and manage your web presence so you can focus on what you do best.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href="mailto:hello@digitalpivot.ca" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors">
                <Mail className="w-4 h-4" /> hello@digitalpivot.ca
              </a>
              <a href="tel:+16473218000" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors">
                <Phone className="w-4 h-4" /> +1 (647) 321-8000
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#process" className="hover:text-teal-400 transition-colors">Web Design</a></li>
              <li><a href="/#portfolio" className="hover:text-teal-400 transition-colors">Portfolio</a></li>
              <li><a href="/#pricing" className="hover:text-teal-400 transition-colors">Pricing</a></li>
              <li><a href="/#contact" className="hover:text-teal-400 transition-colors">Website Audits</a></li>
              <li><a href="/#contact" className="hover:text-teal-400 transition-colors">Site Management</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#faq" className="hover:text-teal-400 transition-colors">FAQ</a></li>
              <li><Link to="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
              <li><a href="/#contact" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
              <li><Link to="/admin" className="hover:text-teal-400 transition-colors">Client Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {new Date().getFullYear()} Digital Pivot. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs">
            <Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-teal-400 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
