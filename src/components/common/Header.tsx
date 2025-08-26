import React from 'react';
import { Link } from 'react-router-dom';

import logo from '@/assets/logo.png';
import { BookOpen, GraduationCap, LogOut, User } from 'lucide-react';

import { useIsAuthenticated, useLogout, useUser } from '@/hooks/queries/useUser';

import { ThemeSelector } from '@/components/ThemeSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const logout = useLogout();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-border bg-background fixed top-0 right-0 left-0 z-20 h-14 border-b shadow-sm">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Socratic Bots Logo" className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <Link
              to="/"
              className="text-foreground hover:text-primary text-xl leading-tight font-bold transition-colors"
            >
              Socratic Bots
            </Link>
            <span className="text-muted-foreground -mt-1 text-xs">Agent + Helper Framework</span>
          </div>
        </div>

        <nav className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <ThemeSelector />

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="hidden flex-col sm:flex">
                    <span className="text-foreground text-sm font-medium">{user.name}</span>
                    <div className="flex items-center space-x-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          user.isProfessor
                            ? 'border-primary/20 bg-primary/10 text-primary'
                            : 'border-secondary/20 bg-secondary/10 text-secondary-foreground'
                        }`}
                      >
                        {user.isProfessor ? (
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
                className="border-border text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
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
              className="border-primary/20 text-primary hover:border-primary hover:bg-primary/10"
            >
              <Link to="/login">
                <User className="mr-1 h-4 w-4" />
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
