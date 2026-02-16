import React from 'react';
import Hero, { Features, ResourcesSection } from './components/Hero';
import ChatWidget from './components/ChatWidget';
import { GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-teal-600" />
                <span className="font-bold text-xl text-slate-800">डर के आगे परीक्षा में जीत है</span>
              </div>
            </div>
            <div className="flex items-center">
              <a href="#" className="text-slate-500 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
              <a href="#features" className="text-slate-500 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">Resources</a>
              <a href="#" className="text-slate-500 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">About Us</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Hero />
      <Features />
      <ResourcesSection />

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">BoardExamDost</h3>
              <p className="text-slate-400 text-sm">
                Supporting Indian students through their board exam journey with mental wellness tools and study strategies.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Helplines</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Tele-MANAS: <span className="text-white font-medium">14416</span></li>
                <li>Manodarpan (मनोदर्पण)<span className="text-white font-medium">8448440632</span></li>
                <li>Emotional Support: <span className="text-white font-medium">+91 44 2464 0050</span></li>
                <li>Vandrevala Foundation: <span className="text-white font-medium">1860 266 2345</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-teal-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} BoardExamDost Wellness Services. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatWidget />
    </div>
  );
};

export default App;
