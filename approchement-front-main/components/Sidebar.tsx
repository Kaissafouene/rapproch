import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  Settings, 
  Bot, 
  TrendingUp, 
  FileText, 
  FileBarChart, 
  Search,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user, onLogout, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'upload', label: 'Import Documents', icon: Upload },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'ai', label: 'Assistant IA', icon: Bot },
    { id: 'results', label: 'Résultats', icon: TrendingUp },
    { id: 'regularization', label: 'Écritures Régul.', icon: FileText },
    { id: 'reports', label: 'Rapports', icon: FileBarChart },
    ...(user?.role === 'admin' ? [{ id: 'audit', label: 'Audit Logs', icon: Search }] : [])
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-white/10 backdrop-blur-md min-h-screen shadow-lg border-r border-white/20
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        {/* Collapse Toggle Button - Desktop Only */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white/30 transition-colors z-10"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">RB</span>
          </div>
          <div className={`ml-3 overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
            <h1 className="text-lg font-semibold text-white whitespace-nowrap">Rapprochement</h1>
            <p className="text-xs text-white/70 whitespace-nowrap">Bancaire IA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-white/20 text-white border-l-2 border-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${isCollapsed ? 'lg:justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'lg:mr-0 mr-3' : 'mr-3'}`} />
              <span className={`whitespace-nowrap overflow-hidden text-ellipsis ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className={`absolute bottom-0 p-4 border-t border-white/20 ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'}`}>
        <div className={`flex items-center mb-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className={`ml-3 flex-1 overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
            <p className="text-sm font-medium text-white truncate">{user?.full_name || user?.username}</p>
            <p className="text-xs text-white/70 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:bg-red-500/20 rounded-lg transition-colors ${isCollapsed ? 'lg:justify-center' : ''}`}
          title={isCollapsed ? 'Déconnexion' : ''}
        >
          <LogOut className={`w-4 h-4 ${isCollapsed ? 'lg:mr-0 mr-3' : 'mr-3'}`} />
          <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>Déconnexion</span>
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;