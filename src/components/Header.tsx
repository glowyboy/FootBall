import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <button className="hamburger-menu" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="header-title">
          <h2>مرحباً بك في لوحة التحكم</h2>
        </div>
      </div>
    </header>
  );
}
