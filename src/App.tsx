import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MatchesPage from './pages/MatchesPage';
import CategoriesPage from './pages/CategoriesPage';
import ChannelsPage from './pages/ChannelsPage';
import AdsPage from './pages/AdsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import { adminNotificationService } from './services/notificationService';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Start automatic notification scheduler when app loads
  useEffect(() => {
    console.log('🚀 Starting automatic notification scheduler...');
    adminNotificationService.startNotificationScheduler();
    
    return () => {
      console.log('🛑 Stopping notification scheduler...');
    };
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'matches':
        return <MatchesPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'channels':
        return <ChannelsPage />;
      case 'ads':
        return <AdsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <div className="animated-bg"></div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          closeSidebar();
        }}
        isOpen={sidebarOpen}
      />
      <div className="main-content">
        <Header onMenuClick={toggleSidebar} />
        <main className="content-wrapper">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
