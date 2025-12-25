import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';

export default function SettingsPrivacy() {
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
            {t('privacyPolicy')}
          </h1>
          
          <div className="w-20" />
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
            <p>
              This privacy policy explains how we collect, use, and protect your personal information when you use our productivity application.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including your email address, name, and productivity data such as habits, tasks, and screen time usage. This information is necessary to provide you with the app's core functionality.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">How We Use Your Information</h2>
            <p>
              Your data is used solely to provide and improve the app's services. We use your productivity data to generate insights, track progress, and help you achieve your goals. We do not sell your personal information to third parties.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Data Storage and Security</h2>
            <p>
              Your data is stored securely on our servers with industry-standard encryption. We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, or destruction.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Data Sharing</h2>
            <p>
              We do not share your personal information with third parties except when required by law or with your explicit consent. Analytics and performance data may be shared in aggregated, anonymized form.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information at any time. You can also request a copy of your data or restrict how we use it. To exercise these rights, please contact us through the Contact section.
            </p>

            <h2 className="text-white text-base font-bold mt-6 mb-3">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any significant changes by email or through the app. Your continued use of the app after such changes constitutes acceptance of the updated policy.
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