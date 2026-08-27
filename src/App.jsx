import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import AdireDivider from './components/AdireDivider';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import GlobalSearchModal from './components/GlobalSearchModal';

import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import MonarchyPage from './pages/MonarchyPage';
import FamiliesPage from './pages/FamiliesPage';
import AssociationsPage from './pages/AssociationsPage';
import EducationPage from './pages/EducationPage';
import FaithPage from './pages/FaithPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
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
import NotFoundPage from './pages/NotFoundPage';
import AiChat from './components/AiChat';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children }) {
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
    <>
      <Nav />
      <div style={{ paddingTop: 56 }}>
        <AdireDivider />
        {children}
        <Footer />
      </div>
      <AiChat />
      <NetworkStatus />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/monarchy" element={<MonarchyPage />} />
            <Route path="/families" element={<FamiliesPage />} />
            <Route path="/associations" element={<AssociationsPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/faith" element={<FaithPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/news" element={<NewsPage />} />
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
            <Route path="/signin" element={<SignInPage />} />
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
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
