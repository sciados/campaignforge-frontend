// pages/jwlibrarylinux.js (or app/jwlibrarylinux/page.js for App Router)

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function JWLibraryLinuxWelcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompatible, setIsCompatible] = useState(null);

  const screenshots = [
    {
      title: "JW Library Running on Ubuntu",
      description: "Full functionality with publications, videos, and audio",
      image: "/images/jwlibrary-ubuntu.png"
    },
    {
      title: "Desktop Integration",
      description: "Appears in your applications menu like any native app",
      image: "/images/jwlibrary-menu.png"
    },
    {
      title: "Complete Library Access",
      description: "Access all publications, study tools, and media",
      image: "/images/jwlibrary-features.png"
    }
  ];

  const supportedDistros = [
    {
      name: "Ubuntu",
      versions: ["20.04 LTS", "22.04 LTS", "24.04 LTS"],
      logo: "🟠",
      tested: true,
      popularity: "Most Popular"
    },
    {
      name: "Linux Mint",
      versions: ["20.x", "21.x", "22.x"],
      logo: "🟢",
      tested: true,
      popularity: "Beginner Friendly"
    },
    {
      name: "Debian",
      versions: ["10 (Buster)", "11 (Bullseye)", "12 (Bookworm)"],
      logo: "🔴",
      tested: true,
      popularity: "Stable"
    },
    {
      name: "Fedora",
      versions: ["37", "38", "39", "40+"],
      logo: "🔵",
      tested: true,
      popularity: "Latest Features"
    },
    {
      name: "Arch Linux",
      versions: ["Rolling Release"],
      logo: "⚫",
      tested: true,
      popularity: "Advanced Users"
    },
    {
      name: "openSUSE",
      versions: ["Leap 15.4+", "Tumbleweed"],
      logo: "🟢",
      tested: false,
      popularity: "May Work"
    }
  ];

  const features = [
    {
      icon: "🚀",
      title: "One-Click Installation",
      description: "Download and run our installer script - everything is automated"
    },
    {
      icon: "🍷",
      title: "Wine Pre-Configured",
      description: "We handle all Wine setup, dependencies, and optimization for you"
    },
    {
      icon: "🖥️",
      title: "Desktop Integration",
      description: "JW Library appears in your applications menu like a native app"
    },
    {
      icon: "🔧",
      title: "Automatic Updates",
      description: "Easy update mechanism to get the latest JW Library version"
    },
    {
      icon: "🗑️",
      title: "Clean Uninstall",
      description: "Remove everything completely with our uninstaller script"
    },
    {
      icon: "📱",
      title: "Full Functionality",
      description: "Publications, videos, audio, annotations - everything works"
    }
  ];

  const requirements = [
    "64-bit Linux system (x86_64 architecture)",
    "At least 4GB RAM (8GB recommended)",
    "2GB free disk space",
    "Internet connection for installation",
    "Administrator/sudo privileges",
    "Graphics drivers properly installed"
  ];

  useEffect(() => {
    // Auto-advance slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [screenshots.length]);

  useEffect(() => {
    // Check basic compatibility
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isLinux = userAgent.includes('linux') && !userAgent.includes('android');
      const is64Bit = userAgent.includes('x86_64') || userAgent.includes('amd64');
      
      setIsCompatible(isLinux && is64Bit);
    }
  }, []);

  return (
    <>
      <Head>
        <title>JW Library for Linux - Free Installation Tool | Rodgers Digital</title>
        <meta name="description" content="Install JW Library on any Linux distribution with our automated installer. Supports Ubuntu, Mint, Fedora, Debian, and Arch Linux. Free tool by Rodgers Digital." />
        <meta name="keywords" content="JW Library Linux, Jehovah Witnesses Linux, Wine JW Library, Ubuntu JW Library, Linux Mint JW Library" />
        <meta property="og:title" content="JW Library for Linux - Free Installation Tool" />
        <meta property="og:description" content="Install JW Library on any Linux distribution with our automated installer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/jwlibrary-linux-preview.jpg" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Navigation */}
        <nav className="bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RD</span>
                </div>
                <span className="text-white font-semibold">Rodgers Digital</span>
              </div>
              <div className="text-sm text-blue-200">
                Free Linux Tools
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block bg-blue-500 bg-opacity-20 text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-400 border-opacity-30">
                🐧 Linux Compatible Tool
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              JW Library
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                for Linux
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Install JW Library on any Linux distribution with our automated installer. 
              No Wine expertise required - we handle everything for you.
            </p>

            {/* Compatibility Check */}
            {isCompatible !== null && (
              <div className={`inline-flex items-center px-6 py-3 rounded-full mb-8 ${
                isCompatible 
                  ? 'bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30' 
                  : 'bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-30'
              }`}>
                <span className="text-2xl mr-3">
                  {isCompatible ? '✅' : '⚠️'}
                </span>
                <span className={`font-medium ${isCompatible ? 'text-green-200' : 'text-yellow-200'}`}>
                  {isCompatible 
                    ? 'Your system appears compatible!' 
                    : 'Please check system requirements below'
                  }
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/jwlibrarylinuxinstaller">
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2">
                  <span>🚀</span>
                  <span>Get Started - Free Download</span>
                </button>
              </Link>
              
              <button 
                onClick={() => document.getElementById('requirements').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white bg-opacity-10 text-white px-6 py-4 rounded-xl font-medium hover:bg-opacity-20 transition-all duration-300 border border-white border-opacity-20"
              >
                Check Compatibility
              </button>
            </div>

            <div className="mt-8 text-sm text-blue-200">
              ⭐ Free tool • No registration required • Open source approach
            </div>
          </div>
        </section>

        {/* Screenshot Carousel */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              See JW Library Running on Linux
            </h2>
            
            <div className="relative bg-black bg-opacity-30 rounded-2xl p-8 backdrop-blur-sm border border-white border-opacity-10">
              <div className="relative h-96 bg-gray-800 rounded-xl overflow-hidden">
                {/* Placeholder for screenshots */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {screenshots[currentSlide].title}
                    </h3>
                    <p className="text-gray-300">
                      {screenshots[currentSlide].description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Slide indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Why Choose Our Installer?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-xl p-6 hover:bg-opacity-10 transition-all duration-300 hover:transform hover:-translate-y-2"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Distributions */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Supported Linux Distributions
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportedDistros.map((distro, index) => (
                <div
                  key={index}
                  className={`bg-white bg-opacity-5 backdrop-blur-sm border rounded-xl p-6 ${
                    distro.tested 
                      ? 'border-green-400 border-opacity-30' 
                      : 'border-yellow-400 border-opacity-30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{distro.logo}</span>
                      <h3 className="text-xl font-semibold text-white">
                        {distro.name}
                      </h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      distro.tested 
                        ? 'bg-green-500 bg-opacity-20 text-green-200' 
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-200'
                    }`}>
                      {distro.popularity}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    {distro.versions.map((version, vIndex) => (
                      <div key={vIndex} className="text-sm text-blue-200">
                        • {version}
                      </div>
                    ))}
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    distro.tested ? 'text-green-300' : 'text-yellow-300'
                  }`}>
                    {distro.tested ? '✅ Fully Tested' : '⚠️ Should Work'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section id="requirements" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              System Requirements
            </h2>
            
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <span className="mr-3">✅</span>
                    Minimum Requirements
                  </h3>
                  <ul className="space-y-3">
                    {requirements.map((req, index) => (
                      <li key={index} className="text-blue-100 flex items-start">
                        <span className="text-blue-400 mr-3 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <span className="mr-3">⚡</span>
                    Installation Process
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                      <div>
                        <div className="text-white font-medium">Download Script</div>
                        <div className="text-blue-200 text-sm">One-click download from our tool</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                      <div>
                        <div className="text-white font-medium">Run Installer</div>
                        <div className="text-blue-200 text-sm">Automated Wine setup and configuration</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                      <div>
                        <div className="text-white font-medium">Launch JW Library</div>
                        <div className="text-blue-200 text-sm">Find it in your applications menu</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Install JW Library?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Join thousands of Linux users who have successfully installed JW Library with our tool.
            </p>
            
            <Link href="/jwlibrarylinuxinstaller">
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-12 py-6 rounded-xl text-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 transition-all duration-300 mb-8">
                Start Installation Now
              </button>
            </Link>
            
            <div className="text-sm text-blue-200 space-y-2">
              <div>✅ Free forever • No registration required • No data collection</div>
              <div>💖 Made with love for the Linux community by Rodgers Digital</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white border-opacity-10 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RD</span>
                  </div>
                  <span className="text-white font-semibold">Rodgers Digital</span>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Creating useful tools and solutions for developers and technology enthusiasts worldwide.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Useful Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/jwlibrarylinuxinstaller" className="text-blue-200 hover:text-white transition-colors">Installation Tool</Link></li>
                  <li><a href="https://rodgersdigital.com" className="text-blue-200 hover:text-white transition-colors">Main Website</a></li>
                  <li><a href="mailto:support@rodgersdigital.com" className="text-blue-200 hover:text-white transition-colors">Get Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">About This Tool</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>• Open source approach</li>
                  <li>• Community driven</li>
                  <li>• Regularly updated</li>
                  <li>• Free to use</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white border-opacity-10 pt-8 text-center">
              <p className="text-blue-300 text-sm">
                © 2025 Rodgers Digital. This tool is provided free of charge to the Linux community.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}