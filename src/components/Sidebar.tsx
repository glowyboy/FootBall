import { Home, Trophy, Folder, Tv, DollarSign, Bell, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
}

const menuItems = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'matches', label: 'إدارة المباريات', icon: Trophy },
  { id: 'categories', label: 'إدارة التصنيفات', icon: Folder },
  { id: 'channels', label: 'إدارة القنوات', icon: Tv },
  { id: 'ads', label: 'إدارة الإعلانات', icon: DollarSign },
  { id: 'notifications', label: 'إرسال إشعارات', icon: Bell },
  { id: 'settings', label: 'إعدادات التطبيق', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange, isOpen }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <Trophy className="logo-icon" />
          <h1 className="logo-text">لوحة التحكم</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
