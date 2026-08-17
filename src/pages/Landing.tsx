import React from 'react';
import { Link } from 'react-router-dom';

import { ArrowRight, LogIn, Sparkles } from 'lucide-react';

import Header from '@/components/common/Header';
import HomeContent from '@/components/home/HomeContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

const Landing: React.FC = () => {
  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1 overflow-auto p-6 pt-20">
        <HomeContent>
          <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-r">
            <CardContent className="p-8 text-center">
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="mb-4 flex justify-center">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Sparkles className="text-primary h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">
                  Ready to Transform Your Teaching?
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Join educators who are revolutionizing learning with AI-powered conversations that
                  adapt, engage, and track student progress.
                </CardDescription>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Link to="/login">
                      <LogIn className="mr-2 h-5 w-5" />
                      Log In
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </HomeContent>
      </main>
    </div>
  );
};

export default Landing;
