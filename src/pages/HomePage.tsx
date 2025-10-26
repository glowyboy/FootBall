import { Trophy, Folder, Tv, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [stats, setStats] = useState({
    matches: 0,
    categories: 0,
    channels: 0,
    activeMatches: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [matchesRes, categoriesRes, channelsRes, activeMatchesRes] = await Promise.all([
      supabase.from('matches').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('channels').select('id', { count: 'exact', head: true }),
      supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'جارية الآن'),
    ]);

    setStats({
      matches: matchesRes.count || 0,
      categories: categoriesRes.count || 0,
      channels: channelsRes.count || 0,
      activeMatches: activeMatchesRes.count || 0,
    });
  };

  const statCards = [
    { label: 'إجمالي المباريات', value: stats.matches, icon: Trophy, color: 'purple' },
    { label: 'المباريات الجارية', value: stats.activeMatches, icon: TrendingUp, color: 'cyan' },
    { label: 'التصنيفات', value: stats.categories, icon: Folder, color: 'pink' },
    { label: 'القنوات', value: stats.channels, icon: Tv, color: 'blue' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">لوحة التحكم الرئيسية</h1>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">
                <Icon size={32} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="welcome-section">
        <div className="welcome-card">
          <h2>مرحباً بك في لوحة التحكم</h2>
          <p>إدارة شاملة لجميع المباريات والقنوات والتصنيفات من مكان واحد</p>
        </div>
      </div>
    </div>
  );
}
