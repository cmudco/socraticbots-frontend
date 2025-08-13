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

import { useAuth } from '@/hooks/useAuth';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Educational Customization',
      description:
        'Design how your AI learning companion interacts with students through customizable prompts, learning objectives, and teaching methodologies.',
      color: 'violet',
    },
    {
      icon: BarChart3,
      title: 'Learning Progress Tracking',
      description:
        'Set specific learning objectives and educational goals, then monitor student progress in real-time with detailed analytics and insights.',
      color: 'emerald',
    },
    {
      icon: FileText,
      title: 'Content Integration',
      description:
        "Upload course materials, learning resources, and reference documents to enhance your bot's knowledge base and create comprehensive learning experiences.",
      color: 'blue',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Learning Insights',
      description:
        'Receive instant insights on student interactions and learning progress, enabling timely interventions and personalized educational guidance.',
      color: 'orange',
    },
    {
      icon: Brain,
      title: 'Flexible AI Models',
      description:
        "Choose from different AI models including OpenAI and Anthropic's Claude, allowing you to select the best foundation model for your specific educational needs.",
      color: 'purple',
    },
    {
      icon: RefreshCw,
      title: 'Continuous Learning Sessions',
      description:
        'Bots remember previous conversations and learning progress, enabling continuous educational experiences across multiple sessions and building on previously mastered concepts.',
      color: 'indigo',
    },
  ];

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      violet: 'bg-violet-100 text-violet-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <Card className="border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <CardContent className="p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <Sparkles className="h-8 w-8" />
            </div>
            <Badge variant="secondary" className="border-white/30 bg-white/20 text-white">
              Agent + Helper Framework
            </Badge>
          </div>
          <CardTitle className="mb-4 text-4xl font-bold text-white">
            Socratic Bots: Intelligent Learning Companions
          </CardTitle>
          <CardDescription className="text-xl leading-relaxed text-blue-100">
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
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-6 w-6 text-blue-600" />
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
              <div className="flex items-start gap-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 p-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-slate-800">For Educators</h4>
                  <p className="text-sm text-gray-700">
                    Create personalized AI tutors that understand your curriculum and teaching
                    style.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border-l-4 border-l-violet-500 bg-violet-50/50 p-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-slate-800">For Students</h4>
                  <p className="text-sm text-gray-700">
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
              <div className="rounded-lg bg-violet-100 p-2">
                <Brain className="h-6 w-6 text-violet-600" />
              </div>
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-base">
              Our revolutionary dual-AI approach uses two specialized models working in harmony:
            </CardDescription>
            <div className="space-y-3">
              <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0 bg-emerald-100 text-emerald-700">
                      Agent
                    </Badge>
                    <p className="text-sm text-gray-700">
                      Manages direct conversations with students, responding based on your custom
                      educational content and teaching strategies.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0 bg-blue-100 text-blue-700">
                      Helper
                    </Badge>
                    <p className="text-sm text-gray-700">
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
                    <div className={`rounded-xl p-3 ${getIconColorClasses(feature.color)}`}>
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
        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <CardContent className="p-8 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-violet-100 p-3">
                  <Sparkles className="h-8 w-8 text-violet-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">
                Ready to Transform Your Teaching?
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Join educators who are revolutionizing learning with AI-powered conversations that
                adapt, engage, and track student progress.
              </CardDescription>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/books')}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Create Your First Chatbot Group
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
