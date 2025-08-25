import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  FileText,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Educational Customization',
      description:
        'Design how your AI learning companion interacts with students through customizable prompts, learning objectives, and teaching methodologies.',
    },
    {
      icon: BarChart3,
      title: 'Learning Progress Tracking',
      description:
        'Set specific learning objectives and educational goals, then monitor student progress in real-time with detailed analytics and insights.',
    },
    {
      icon: FileText,
      title: 'Content Integration',
      description:
        "Upload course materials, learning resources, and reference documents to enhance your bot's knowledge base and create comprehensive learning experiences.",
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Learning Insights',
      description:
        'Receive instant insights on student interactions and learning progress, enabling timely interventions and personalized educational guidance.',
    },
    {
      icon: Brain,
      title: 'Flexible AI Models',
      description:
        "Choose from different AI models including OpenAI and Anthropic's Claude, allowing you to select the best foundation model for your specific educational needs.",
    },
    {
      icon: RefreshCw,
      title: 'Continuous Learning Sessions',
      description:
        'Bots remember previous conversations and learning progress, enabling continuous educational experiences across multiple sessions and building on previously mastered concepts.',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <Card className="from-primary to-primary/80 text-primary-foreground border-none bg-gradient-to-r shadow-xl">
        <CardContent className="p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary-foreground/20 rounded-lg p-2">
              <Sparkles className="h-8 w-8" />
            </div>
            <Badge
              variant="secondary"
              className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground"
            >
              Agent + Helper Framework
            </Badge>
          </div>
          <CardTitle className="text-primary-foreground mb-4 text-4xl font-bold">
            Socratic Bots: Intelligent Learning Companions
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 text-xl leading-relaxed">
            Create AI-powered educational assistants that engage students in meaningful
            conversations while tracking progress toward specific learning objectives. Powered by
            the advanced Agent + Helper Framework.
          </CardDescription>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Users className="text-primary h-6 w-6" />
              </div>
              What is Socratic Bots?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-base leading-relaxed">
              Socratic Bots is an innovative educational platform that enables educators to create
              AI-powered learning companions with built-in progress tracking. Originally developed
              for educational applications at CMU, our platform transforms traditional learning
              materials into interactive, conversational experiences that adapt to each student's
              needs.
            </CardDescription>

            <div className="space-y-3">
              <div className="border-l-primary bg-primary/5 flex items-start gap-3 rounded-lg border-l-4 p-3">
                <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <BookOpen className="text-primary h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-foreground mb-1 font-medium">For Educators</h4>
                  <p className="text-muted-foreground text-sm">
                    Create personalized AI tutors that understand your curriculum and teaching
                    style.
                  </p>
                </div>
              </div>

              <div className="border-l-primary bg-primary/5 flex items-start gap-3 rounded-lg border-l-4 p-3">
                <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <TrendingUp className="text-primary h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-foreground mb-1 font-medium">For Students</h4>
                  <p className="text-muted-foreground text-sm">
                    Engage with AI companions that provide personalized learning experiences and
                    track your progress.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Brain className="text-primary h-6 w-6" />
              </div>
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-base">
              Our revolutionary dual-AI approach uses two specialized models working in harmony:
            </CardDescription>
            <div className="space-y-3">
              <Card className="border-l-primary bg-primary/5 border-l-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0">
                      Agent
                    </Badge>
                    <p className="text-muted-foreground text-sm">
                      Manages direct conversations with students, responding based on your custom
                      educational content and teaching strategies.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-primary bg-primary/5 border-l-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0">
                      Helper
                    </Badge>
                    <p className="text-muted-foreground text-sm">
                      Works behind the scenes to monitor learning conversations and track progress
                      toward specific educational goals. Provides real-time feedback to both
                      students and educators.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="space-y-10">
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="text-sm">
            Key Features
          </Badge>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Powerful Tools for Modern Education</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Everything you need to create, deploy, and manage AI-powered learning experiences
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`bg-primary/10 text-primary rounded-xl p-3`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="group-hover:text-primary text-lg transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Getting Started Section - Only show to professors */}
      {user?.isProfessor && (
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
                  onClick={() => navigate('/books')}
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
    </div>
  );
};

export default Home;
