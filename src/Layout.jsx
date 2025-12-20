import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';

export default function Layout({ children, currentPageName }) {
  // Layout is minimal - just renders the page content
  // Home menu is a separate page
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}