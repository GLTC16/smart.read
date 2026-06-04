'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="w-full border-t py-8 px-6"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(10,10,18,0.8)',
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <BookOpen size={14} style={{ color: 'var(--accent-hover)' }} />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>SmartRead</span>
        </div>

        {/* Legal links */}
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center">
          {[
            { href: '/about', label: 'Sobre Nosotros' },
            { href: '/privacy', label: 'Privacidad' },
            { href: '/terms', label: 'Términos' },
            { href: '/contact', label: 'Contacto' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
          © {new Date().getFullYear()} SmartRead
        </p>
      </div>
    </footer>
  );
}
