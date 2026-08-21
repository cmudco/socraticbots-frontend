import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowRight, BookOpen, Brain, Sparkles } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';

import HomeContent from '@/components/home/HomeContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

const Home: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();

  return (
    <HomeContent>
      {/* Getting Started Section - Only show to creators */}
      {user?.isCreator && (
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
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/bot-groups')}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Create Your First Chatbot Group
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Explore Sample Bots
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </HomeContent>
  );
};

export default Home;
