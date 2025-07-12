'use client'

import { useEffect, useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'

export const dynamic = 'force-dynamic'

// Contact Form Component
function ContactForm() {
  const [state, handleSubmit] = useForm("xnnveeor")
  
  if (state.succeeded) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-green-700 font-medium mb-2">✅ Message sent successfully!</div>
        <div className="text-green-600">
          Thanks for reaching out. We&apos;ll get back to you soon.
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email" 
          name="email"
          required
          className="w-full bg-gray-100 border-none rounded-xl px-6 py-4 text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-3 focus:ring-blue-500/20 transition-all"
          placeholder="your@email.com"
        />
        <ValidationError 
          prefix="Email" 
          field="email"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full bg-gray-100 border-none rounded-xl px-6 py-4 text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-3 focus:ring-blue-500/20 transition-all resize-none"
          placeholder="Tell us about your project or ask us anything..."
        />
        <ValidationError 
          prefix="Message" 
          field="message"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      <button 
        type="submit" 
        disabled={state.submitting}
        className="w-full bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

export default function ComingSoonPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Set launch date (you can adjust this)
  const launchDate = new Date('2025-09-01T00:00:00').getTime()

  useEffect(() => {
    setMounted(true)
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [launchDate])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email)
    setIsSubmitted(true)
    setEmail('')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-medium">RD</span>
              </div>
              <span className="text-xl font-semibold text-black">RodgersDigital</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-32 text-center">
          {/* Status Badge */}
          <div className="mb-8">
            <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
              🚀 Coming Soon
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl font-light text-black mb-6 leading-tight">
            We&apos;re building something
            <br />
            <span className="font-semibold">extraordinary.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
            RodgersDigital is crafting the future of intelligent content transformation. 
            Get ready for AI-powered campaign creation like never before.
          </p>

          {/* Countdown Timer */}
          <div className="mb-16">
            <h2 className="text-2xl font-medium text-black mb-8">Launch Countdown</h2>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="bg-gray-100 rounded-2xl p-6 min-w-[100px]">
                  <div className="text-3xl font-semibold text-black">{timeLeft.days}</div>
                  <div className="text-sm text-gray-600 mt-1">Days</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-2xl p-6 min-w-[100px]">
                  <div className="text-3xl font-semibold text-black">{timeLeft.hours}</div>
                  <div className="text-sm text-gray-600 mt-1">Hours</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-2xl p-6 min-w-[100px]">
                  <div className="text-3xl font-semibold text-black">{timeLeft.minutes}</div>
                  <div className="text-sm text-gray-600 mt-1">Minutes</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-2xl p-6 min-w-[100px]">
                  <div className="text-3xl font-semibold text-black">{timeLeft.seconds}</div>
                  <div className="text-sm text-gray-600 mt-1">Seconds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Signup */}
          <div className="mb-16">
            <h3 className="text-2xl font-medium text-black mb-4">Be the first to know</h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Join our waitlist and get early access when we launch.
            </p>
            
            {!isSubmitted ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-gray-100 border-none rounded-xl px-6 py-4 text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-3 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-900 transition-all whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-green-700 font-medium mb-2">✅ You&apos;re on the list!</div>
                <div className="text-green-600 text-sm">
                  We&apos;ll notify you as soon as we launch.
                </div>
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">AI-Powered Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Revolutionary content analysis and campaign generation powered by advanced AI.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate complete marketing campaigns in minutes, not hours or days.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Complete Solutions</h3>
              <p className="text-gray-600 leading-relaxed">
                From social media to landing pages - everything you need in one platform.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-light text-black mb-12">
              What we&apos;re working on
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-green-700">COMPLETED</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Core AI Engine</h3>
                <p className="text-gray-600">
                  Advanced content processing and campaign generation algorithms are ready.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-blue-700">IN PROGRESS</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">User Interface</h3>
                <p className="text-gray-600">
                  Crafting an intuitive, beautiful interface that makes AI accessible to everyone.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-orange-700">NEXT UP</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Platform Integrations</h3>
                <p className="text-gray-600">
                  Seamless connections with your favorite marketing tools and platforms.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">PLANNED</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Beta Testing</h3>
                <p className="text-gray-600">
                  Exclusive early access for our waitlist members to test and provide feedback.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-black mb-4">
                Get in touch
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Have a question or want to discuss a project? We would love to hear from you.
              </p>
            </div>
            
            <div className="max-w-lg mx-auto">
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-16 px-6 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-medium">RD</span>
              </div>
              <span className="text-xl font-semibold text-black">RodgersDigital</span>
            </div>
            
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Building the future of intelligent marketing. Stay tuned for something amazing.
            </p>
            
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <span>© 2025 RodgersDigital</span>
              <a href="mailto:hello@rodgersdigital.com" className="hover:text-black transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}