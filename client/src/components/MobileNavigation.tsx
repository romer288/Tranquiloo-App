import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  BarChart3, 
  Stethoscope, 
  Users 
} from 'lucide-react';

const MobileNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/treatment-resources', icon: Stethoscope, label: 'Treatment' },
    { path: '/find-therapist', icon: Users, label: 'Therapist' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden"
      style={{
        zIndex: 99999,
        position: 'fixed',
        isolation: 'isolate'
      }}
    >
      <nav className="flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center p-3 flex-1 transition-colors touch-manipulation min-h-[60px] ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 active:text-gray-700'
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              style={{
                zIndex: 10000,
                position: 'relative',
                touchAction: 'manipulation'
              }}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = item.path;
              }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavigation;