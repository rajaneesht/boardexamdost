import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Brain, Coffee, ExternalLink, Apple } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Ace your exams with</span>{' '}
                <span className="block text-teal-600 xl:inline">a calm mind.</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                BoardExamDost is your personal wellness companion for Board Exams. 
                Get anxiety relief, scientific study techniques, and daily motivation. 
                Because your mental health matters as much as your marks.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <a href="#features" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 md:py-4 md:text-lg md:px-10">
                    Explore Ways to Relax
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-slate-50">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full opacity-90"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
          alt="Students studying happily"
        />
      </div>
    </div>
  );
};

export const Features: React.FC = () => {
  const [quote, setQuote] = useState("Believe you can and you're halfway there.");

  useEffect(() => {
    const quotes = [
      "Arise, awake, and stop not till the goal is reached. - Swami Vivekananda",
      "You have to dream before your dreams can come true. - APJ Abdul Kalam",
      "Failure will never overtake me if my determination to succeed is strong enough. - Og Mandino",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
      "Don't watch the clock; do what it does. Keep going. - Sam Levenson"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const features = [
    {
      name: 'Anxiety Relief',
      description: 'Guided breathing exercises and grounding techniques to manage exam panic.',
      icon: Heart,
      color: 'bg-rose-100 text-rose-600'
    },
    {
      name: 'Smart Study Tips',
      description: 'Learn the Pomodoro technique, Active Recall, and how to make effective notes.',
      icon: Brain,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      name: 'Daily Motivation',
      description: `"${quote}"`,
      icon: Coffee,
      color: 'bg-amber-100 text-amber-600'
    },
    {
      name: 'Instant Guidance',
      description: 'Ask Mitra for syllabus clarifications, important dates, and quick concept summaries.',
      icon: BookOpen,
      color: 'bg-teal-100 text-teal-600'
    },
    {
      name: 'Healthy Habits',
      description: 'Tips on sleep hygiene, hydration, and brain-boosting nutrition for peak performance.',
      icon: Apple,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div id="features" className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to stay balanced
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 lg:mx-auto">
            We combine technology with empathy to help you navigate the most stressful months of the year.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className={`absolute flex items-center justify-center h-12 w-12 rounded-md ${feature.color}`}>
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-slate-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-slate-500 italic">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export const ResourcesSection: React.FC = () => {
    const academicResources = [
        { name: "CBSE Official Website", url: "https://www.cbse.gov.in/" },
        { name: "ICSE / CISCE Official", url: "https://cisce.org/" },
        { name: "NCERT Books", url: "https://ncert.nic.in/textbook.php" },
        { name: "Swayam Learning Portal", url: "https://swayam.gov.in/" }
    ];

    const supportResources = [
        { 
            name: "National Task Force (NTF) Student Support", 
            url: "https://ntf.education.gov.in/student-support-resources/", 
            description: "Access the Ministry of Education's official repository for student wellness, including Manodarpan and other mental health initiatives." 
        },
        { 
            name: "White Swan Foundation", 
            url: "https://www.whiteswanfoundation.org/education/helpline-widget", 
            description: "A comprehensive mental health knowledge repository with a helpline widget to connect you with support services immediately." 
        }
    ];

    return (
        <div className="bg-white py-12 border-t border-slate-100">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BookOpen className="text-teal-600" size={24}/> 
                        Official Academic Resources
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {academicResources.map((res) => (
                            <a 
                                key={res.name} 
                                href={res.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group bg-white"
                            >
                                <span className="font-medium text-slate-700 group-hover:text-teal-600">{res.name}</span>
                                <ExternalLink size={16} className="text-slate-400 group-hover:text-teal-500" />
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Heart className="text-rose-500" size={24}/>
                        Mental Health & Support
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {supportResources.map((res) => (
                            <a 
                                key={res.name} 
                                href={res.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col p-6 rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-500 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-lg text-slate-800 group-hover:text-teal-600">{res.name}</span>
                                    <ExternalLink size={20} className="text-slate-400 group-hover:text-teal-500" />
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{res.description}</p>
                            </a>
                        ))}
                    </div>
                </div>

             </div>
        </div>
    )
}

export default Hero;
