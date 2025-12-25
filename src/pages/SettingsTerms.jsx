import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';

export default function SettingsTerms() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 pb-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Settings')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('back')}</span>
          </Link>
          
          <h1 className="text-xl font-black bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            {t('termsOfUse')}
          </h1>
          
          <div className="w-20" />
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
            <p>
              By using this productivity application, you agree to the following terms of use. Please read them carefully.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Acceptance of Terms</h2>
            <p>
              By accessing and using this app, you accept and agree to be bound by these terms. If you do not agree to these terms, please do not use the app.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">User Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. You are responsible for all activities that occur under your account.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Acceptable Use</h2>
            <p>
              You agree to use the app only for lawful purposes and in accordance with these terms. You may not use the app in any way that could damage, disable, or impair the service, or interfere with other users' enjoyment of the app.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">User Content</h2>
            <p>
              You retain ownership of any content you create or upload to the app, including tasks, habits, and notes. By using the app, you grant us a license to store and process this content solely for the purpose of providing the service to you.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Intellectual Property</h2>
            <p>
              The app and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Service Availability</h2>
            <p>
              We strive to provide continuous service but do not guarantee that the app will be available at all times. We may suspend or discontinue the service temporarily for maintenance or updates. We are not liable for any interruption of service.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account if you violate these terms. You may also terminate your account at any time by contacting us or using the data deletion feature.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Limitation of Liability</h2>
            <p>
              The app is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the app.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Changes to Terms</h2>
            <p>
              We may modify these terms at any time. We will notify you of any material changes. Your continued use of the app after such changes constitutes acceptance of the new terms.
            </p>

            <p className="mt-6 text-xs text-zinc-600">
              Last updated: December 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}