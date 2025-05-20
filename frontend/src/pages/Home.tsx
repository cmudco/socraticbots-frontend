import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8 mb-10 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">SocraticBots: Intelligent Conversation Assistants</h1>
        <p className="text-xl mb-6">Create AI assistants that engage in meaningful conversations while tracking progress toward specific objectives.  Powered by the DARE Agent + Helper Framework.</p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">What is SocraticBots?</h2>
          <p className="text-gray-700 mb-4">
            SocraticBots is a platform that enables you to create AI-powered conversation assistants with built-in progress tracking. 
            Originally developed for educational textbooks at CMU, our platform has evolved to support a wide range of applications 
            where guided conversations and progress monitoring are valuable.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-700">
            Our unique dual-AI approach uses two specialized models working together:
          </p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li className="mb-2"><span className="font-semibold">The Agent</span> - Manages direct conversations with users, responding based on your custom instructions. </li>
            <li className="mb-2"><span className="font-semibold">The Helper</span> - Works behind the scenes to monitor the conversations and track progress toward specific goals.  Feedback is provided to users in realtime. </li>
          </ul>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Customization</h3>
            <p className="text-gray-700">Define how your AI assistant interacts with users through customizable prompts and instructions.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Goal Tracking</h3>
            <p className="text-gray-700">Set specific learning objectives or tracking goals and monitor user progress in real-time.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Knowledge Integration</h3>
            <p className="text-gray-700">Upload course materials or reference documents to enhance your bot's knowledge base.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Real Time Feedback</h3>
            <p className="text-gray-700">Receive instant insights on user interactions and learning progress, allowing for timely interventions and adaptive guidance.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Cross Platform</h3>
            <p className="text-gray-700">Flexibility to use different AI models including OpenAI and Anthropic's Claude, allowing you to choose the best foundation model for your specific use case.</p>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Home;
