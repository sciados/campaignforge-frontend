'use client';

import { useState, useEffect } from 'react';

export default function JWLibraryLinuxWelcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompatible, setIsCompatible] = useState(null);
  const [mounted, setMounted] = useState(false);

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
      icon: "⚡",
      title: "One-Click Installation",
      description: "Download and run our installer script — everything is automated"
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
      icon: "🔄",
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
      description: "Publications, videos, audio, annotations — everything works"
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
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [screenshots.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isLinux = userAgent.includes('linux') && !userAgent.includes('android');
      const is64Bit = userAgent.includes('x86_64') || userAgent.includes('amd64');
      setIsCompatible(isLinux && is64Bit);
    }
  }, []);

  const scrollToRequirements = () => {
    const element = document.getElementById('requirements');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-system">
      {/* All other sections remain unchanged above */}

      {/* Footer Grid */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="w-max mx-auto mb-12 grid md:grid-cols-3 gap-12">
            <div className="max-w-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">RD</span>
                </div>
                <span className="text-xl font-semibold text-black">RodgersDigital</span>
              </div>
              <p className="text-gray-600 font-light leading-relaxed">
                Creating useful tools and solutions for developers and technology enthusiasts worldwide.
              </p>
            </div>

            <div className="max-w-xs">
              <h4 className="text-black font-medium mb-4">Useful Links</h4>
              <ul className="space-y-3">
                <li><a href="/jwlibrarylinuxinstaller" className="text-gray-600 hover:text-black transition-colors duration-200 font-light">Installation Tool</a></li>
                <li><a href="https://rodgersdigital.com" className="text-gray-600 hover:text-black transition-colors duration-200 font-light">Main Website</a></li>
                <li><a href="mailto:support@rodgersdigital.com" className="text-gray-600 hover:text-black transition-colors duration-200 font-light">Get Support</a></li>
              </ul>
            </div>

            <div className="max-w-xs">
              <h4 className="text-black font-medium mb-4">About This Tool</h4>
              <ul className="space-y-2 text-gray-600 font-light">
                <li>Open source approach</li>
                <li>Community driven</li>
                <li>Regularly updated</li>
                <li>Free to use</li>
              </ul>
            </div>
          </div>          
        </div>
        <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500 font-light">
              © 2025 RodgersDigital. This tool is provided free of charge to the brothers.
            </p>
          </div>
      </section>
    </div>
  );
}
