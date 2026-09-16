import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import AdireDivider from './components/AdireDivider';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import GlobalSearchModal from './components/GlobalSearchModal';

import ComingSoonPage from './pages/ComingSoonPage';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import MonarchyPage from './pages/MonarchyPage';
import FamiliesPage from './pages/FamiliesPage';
import AssociationsPage from './pages/AssociationsPage';
import EducationPage from './pages/EducationPage';
import FaithPage from './pages/FaithPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import TourismPage from './pages/TourismPage';
import BusinessPage from './pages/BusinessPage';
import DiasporaPage from './pages/DiasporaPage';
import EventsPage from './pages/EventsPage';
import ForumPage from './pages/ForumPage';
import MapPage from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import MissOlipakalaPage from './pages/MissOlipakalaPage';
import TimelinePage from './pages/TimelinePage';
import OrikiPage from './pages/OrikiPage';
import QuizPage from './pages/QuizPage';
import CustomPage from './pages/CustomPage';
import IdCardPage from './pages/IdCardPage';
import RoyalAudiencePage from './pages/RoyalAudiencePage';
import MarketplacePage from './pages/MarketplacePage';
import LandRegistryPage from './pages/LandRegistryPage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import HealthPage from './pages/HealthPage';
import GovernancePage from './pages/GovernancePage';
import LivePage from './pages/LivePage';
import VerifyIdPage from './pages/VerifyIdPage';
import SecurityDashboardPage from './pages/SecurityDashboardPage';
import TrackIncidentPage from './pages/TrackIncidentPage';
import MobilePreviewPage from './pages/MobilePreviewPage';
import AdminMobilePreviewPage from './pages/AdminMobilePreviewPage';
import MessagesPage from './pages/MessagesPage';
import NotFoundPage from './pages/NotFoundPage';
import AiChat from './components/AiChat';
import ToastProvider from './components/ToastProvider';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children, onLockDemo, showDemoBanner }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    const handleCustomOpen = () => setSearchOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-global-search', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-global-search', handleCustomOpen);
    };
  }, []);

  return (
    <div style={{ '--demo-offset': showDemoBanner ? '32px' : '0px' }}>
      {/* Demo Status Banner (only shown in development or explicit demo mode) */}
      {showDemoBanner && (
        <div
          style={{
            background: 'linear-gradient(90deg, #14532d 0%, #166534 100%)',
            color: '#bbf7d0',
            padding: '0 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '.72rem',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '32px',
            zIndex: 10000,
            borderBottom: '1px solid rgba(134,239,172,0.3)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}
          className="cinzel"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontWeight: 600 }}>
            <span style={{ fontSize: '.8rem' }}>🟢</span> STAKEHOLDER REVIEW SESSION (AUTHENTICATED PREVIEW)
          </span>
          <button
            onClick={onLockDemo}
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(187,247,208,0.4)',
              color: '#fff',
              padding: '.2rem .65rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '.65rem',
              fontWeight: 600,
              transition: 'all .2s ease',
            }}
            title="Return to Coming Soon landing view"
          >
            🔒 Exit Session / Return to Landing
          </button>
        </div>
      )}

      <Nav />
      <div style={{ paddingTop: showDemoBanner ? 88 : 56 }}>
        <AdireDivider />
        {children}
        <Footer />
      </div>
      <AiChat />
      <NetworkStatus />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export default function App() {
  const isComingSoonEnforced = import.meta.env.VITE_COMING_SOON === 'true';

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return true;
    // If coming soon is not explicitly enforced, production portal is fully live
    if (!isComingSoonEnforced) return true;
    if (import.meta.env.DEV) return true;
    if (window.location.pathname.startsWith('/mobile') || window.location.pathname.startsWith('/track')) return true;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('preview') === 'true' || urlParams.get('pin') === 'ogere2026') {
      localStorage.setItem('ogere_preview_unlocked', 'true');
      sessionStorage.setItem('ogere_preview_unlocked', 'true');
      return true;
    }
    return (
      localStorage.getItem('ogere_preview_unlocked') === 'true' ||
      sessionStorage.getItem('ogere_preview_unlocked') === 'true'
    );
  });

  const handleUnlock = () => {
    localStorage.setItem('ogere_preview_unlocked', 'true');
    sessionStorage.setItem('ogere_preview_unlocked', 'true');
    setIsUnlocked(true);
  };

  const handleLockDemo = () => {
    localStorage.removeItem('ogere_preview_unlocked');
    sessionStorage.removeItem('ogere_preview_unlocked');
    setIsUnlocked(false);
  };

  const showDemoBanner = isComingSoonEnforced && isUnlocked;

  return (
    <ToastProvider>
      <ErrorBoundary>
        <BrowserRouter>
        <ScrollToTop />
        {!isUnlocked ? (
          <ComingSoonPage onUnlock={handleUnlock} />
        ) : (
          <Layout onLockDemo={handleLockDemo} showDemoBanner={showDemoBanner}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/coming-soon" element={<ComingSoonPage onUnlock={handleUnlock} />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/monarchy" element={<MonarchyPage />} />
              <Route path="/families" element={<FamiliesPage />} />
              <Route path="/associations" element={<AssociationsPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/faith" element={<FaithPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/tourism" element={<TourismPage />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/diaspora" element={<DiasporaPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<PostPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/register" element={<SignUpPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/login" element={<SignInPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/miss-olipakala" element={<MissOlipakalaPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/oriki" element={<OrikiPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/p/:slug" element={<CustomPage />} />
              <Route path="/id-card" element={<IdCardPage />} />
              <Route path="/royal-audience" element={<RoyalAudiencePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/land-registry" element={<LandRegistryPage />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/governance" element={<GovernancePage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/verify-id" element={<VerifyIdPage />} />
              <Route path="/verify-id/:code" element={<VerifyIdPage />} />
              <Route path="/security-dashboard" element={<SecurityDashboardPage />} />
              <Route path="/dispatch" element={<SecurityDashboardPage />} />
              <Route path="/track/:id" element={<TrackIncidentPage />} />
              <Route path="/mobile-preview" element={<MobilePreviewPage />} />
              <Route path="/mobile" element={<MobilePreviewPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/chat" element={<MessagesPage />} />
              <Route path="/whatsapp" element={<MessagesPage />} />
              <Route path="/admin-mobile" element={<AdminMobilePreviewPage />} />
              <Route path="/mobile-admin" element={<AdminMobilePreviewPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        )}
      </BrowserRouter>
      </ErrorBoundary>
    </ToastProvider>
  );
}
