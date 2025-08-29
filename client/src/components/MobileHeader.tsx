import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Menu, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const MobileHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('chat-history')) return 'Chat History';
    if (path.includes('chat')) return 'Chat';
    if (path.includes('treatment')) return 'Track Treatment';
    if (path.includes('therapist')) return 'Find Therapist';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('help')) return 'Help';
    if (path.includes('dashboard')) return 'Tranquiloo';
    return 'Tranquiloo';
  };

  const showBackButton = location.pathname !== '/dashboard';

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-[200] pointer-events-auto md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
              data-testid="mobile-back-button"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              console.log('Navigating to notifications');
              navigate('/notifications');
            }}
            className="p-2 touch-manipulation"
            data-testid="mobile-notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="mobile-menu">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/help')}>
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/chat-history')}>
                Chat History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={signOut}
                className="text-red-600"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;