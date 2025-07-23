import React from 'react';
import { Link } from 'react-router-dom';

import logo from '@/assets/logo.png';
import { BookOpen, GraduationCap, LogOut, User } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-14 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Socratic Bots Logo" className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <Link
              to="/"
              className="text-xl leading-tight font-bold text-slate-700 transition-colors hover:text-violet-600"
            >
              Socratic Bots
            </Link>
            <span className="-mt-1 text-xs text-slate-500">Agent + Helper Framework</span>
          </div>
        </div>

        <nav className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-600">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="hidden flex-col sm:flex">
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    <div className="flex items-center space-x-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          user.is_professor
                            ? 'border-violet-200 bg-violet-100 text-violet-700'
                            : 'border-blue-200 bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.is_professor ? (
                          <>
                            <GraduationCap className="mr-1 h-3 w-3" />
                            Professor
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-1 h-3 w-3" />
                            Student
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">
                  <LogOut className="h-4 w-4" />
                </span>
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-violet-200 text-violet-600 hover:border-violet-300 hover:bg-violet-50"
            >
              <Link to="/login">
                <User className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
