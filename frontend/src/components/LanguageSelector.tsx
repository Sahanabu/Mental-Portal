'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'kn')}
      className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="kn">ಕನ್ನಡ</option>
    </select>
  );
}
