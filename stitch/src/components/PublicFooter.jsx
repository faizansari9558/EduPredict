import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function PublicFooter() {
  return (
    <footer className="w-full bg-primary-container text-slate-300 pt-8 pb-6 border-t border-slate-800 selection:bg-secondary/30 selection:text-white">
      <div className="w-full px-6 sm:px-10 lg:px-12 space-y-6">
        {/* Main Footer: Left Brand and Far-Right Link Columns */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12 pb-6 border-b border-slate-700/60 w-full">
          {/* 1. Left Brand & Bio Column */}
          <div className="w-full lg:max-w-md xl:max-w-lg space-y-2.5 text-left shrink-0">
            <div className="flex items-center -ml-1">
              <Logo theme="dark" size="sm" />
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              EduPredict is an AI-powered academic progress and placement prediction intelligence system engineered for higher education institutions, faculty mentors, and aspiring students.
            </p>

          </div>

          {/* 2. Far-Right Link Columns (Platform, Resources, Security & Policies) */}
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between sm:justify-end gap-8 sm:gap-12 lg:gap-14 xl:gap-20 w-full lg:w-auto">
            {/* Column 1: Platform */}
            <div className="space-y-2.5 min-w-[110px] text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home (Lander)</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register Account</Link></li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-2.5 min-w-[120px] text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Resources</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center &amp; FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Schedule Demo</Link></li>
              </ul>
            </div>

            {/* Column 3: Security & Policies (Flush Right) */}
            <div className="space-y-2.5 min-w-[130px] text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Security &amp; Policies</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><span className="text-slate-400">FERPA Isolated</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: 100% Window-Width Match (Far Left to Far Right) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 w-full">
          <p className="text-left">© 2026 EduPredict — Smart Student Academic &amp; Placement Prediction System. All rights reserved.</p>
          <div className="flex items-center gap-6 sm:justify-end">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
