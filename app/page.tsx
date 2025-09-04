"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Users,
  Calendar,
  Zap,
  CheckCircle,
  Heart,
  Star,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Github,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    setIsVisible(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section
        id="hero"
        ref={setSectionRef("hero")}
        className="relative overflow-hidden py-20 px-4 transition-all duration-1000 ease-out bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/30 rounded-full animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-accent/40 rounded-full animate-float delay-500"></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-secondary/50 rounded-full animate-float delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="mx-auto max-w-4xl">
            <div
              className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-8 w-8 text-accent animate-spin-slow" />
                <h1 className="text-balance text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent md:text-7xl animate-gradient-shift">
                  Rite2Rise
                </h1>
                <Sparkles className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-300 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="mt-6 text-xl text-muted-foreground md:text-2xl font-medium animate-slide-in-left">
                {"Connect. Discover. Rise Together."}
              </p>
            </div>

            <div
              className={`transition-all duration-1000 delay-500 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-in-right">
                The community platform where service providers post meaningful events and young people discover
                opportunities to grow, learn, and make an impact.
              </p>
            </div>

            <div
              className={`mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center transition-all duration-1000 delay-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-3 text-lg hover-lift-smooth hover-glow group animate-scale-in"
              >
                <Link href="/events">
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-3 text-lg bg-transparent backdrop-blur-sm hover-lift-smooth hover:shadow-lg animate-scale-in delay-150"
              >
                <Link href="/auth/user/login">Join Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={setSectionRef("how-it-works")}
        className={`py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-100 to-indigo-50 transition-all duration-1000 ease-out ${
          visibleSections.has("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          <div
            className={`text-center mb-16 transition-all duration-800 delay-200 ease-out ${
              visibleSections.has("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to connect communities and create meaningful impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Service Providers Post",
                description:
                  "NGOs, businesses, and organizations share events, workshops, and opportunities on our platform.",
                delay: "delay-100",
              },
              {
                icon: Calendar,
                title: "Users Discover",
                description: "Young people browse and discover events that match their interests and goals.",
                delay: "delay-300",
              },
              {
                icon: Zap,
                title: "Youth Participate",
                description: "Participants join events, build skills, and create positive change in their communities.",
                delay: "delay-500",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className={`text-center p-8 border-border bg-card/80 backdrop-blur-sm hover:bg-card hover-lift-smooth group transition-all duration-700 ease-out ${
                  visibleSections.has("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg hover-glow">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-4 group-hover:text-accent transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        ref={setSectionRef("benefits")}
        className={`py-20 px-4 bg-gradient-to-br from-indigo-50 via-purple-100 to-blue-100 relative overflow-hidden transition-all duration-1000 ease-out ${
          visibleSections.has("benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-32 h-32 bg-accent/10 rounded-full animate-float"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-primary/10 rounded-full animate-float delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`space-y-8 transition-all duration-800 delay-200 ease-out ${
                visibleSections.has("benefits") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
              }`}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                Why Choose Rite2Rise?
              </h2>

              {[
                {
                  icon: CheckCircle,
                  title: "For Young People",
                  description:
                    "Discover meaningful opportunities, build valuable skills, and connect with like-minded peers in your community.",
                  color: "text-green-500",
                },
                {
                  icon: Heart,
                  title: "For Service Providers",
                  description:
                    "Reach engaged youth, increase event participation, and amplify your community impact through our platform.",
                  color: "text-red-500",
                },
                {
                  icon: Star,
                  title: "For Communities",
                  description:
                    "Strengthen local connections, foster collaboration, and create lasting positive change together.",
                  color: "text-yellow-500",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 group hover:translate-x-2 transition-all duration-500 ease-out ${
                    visibleSections.has("benefits") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <benefit.icon
                    className={`h-6 w-6 ${benefit.color} mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`relative group transition-all duration-800 delay-400 ease-out ${
                visibleSections.has("benefits") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img
                src="/diverse-group-of-young-people-collaborating-at-com.jpg"
                alt="Young people participating in community events"
                className="rounded-lg shadow-2xl w-full relative z-10 hover-lift-smooth"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        id="cta"
        ref={setSectionRef("cta")}
        className={`py-20 px-4 bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 relative overflow-hidden transition-all duration-1000 ease-out ${
          visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-white rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white rounded-full animate-pulse delay-1200"></div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2
            className={`text-4xl font-bold text-slate-800 mb-6 transition-all duration-800 delay-200 ease-out ${
              visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Ready to Rise Together?
          </h2>
          <p
            className={`text-xl text-slate-700 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-800 delay-400 ease-out ${
              visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Join thousands of young people and organizations creating positive change in communities worldwide.
          </p>
          <div
            className={`flex flex-col gap-4 sm:flex-row sm:justify-center transition-all duration-800 delay-600 ease-out ${
              visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white hover:bg-gray-100 text-primary px-8 py-3 text-lg hover-lift-smooth group"
            >
              <Link href="/login">
                Browse Events Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3 text-lg bg-transparent backdrop-blur-sm hover-lift-smooth"
            >
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer
        id="footer"
        ref={setSectionRef("footer")}
        className={`relative bg-gradient-to-br from-purple-200 via-indigo-300 to-slate-400 text-slate-800 overflow-hidden transition-all duration-1000 ease-out ${
          visibleSections.has("footer") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
              {/* Brand Section */}
              <div
                className={`lg:col-span-2 space-y-6 transition-all duration-800 delay-200 ease-out ${
                  visibleSections.has("footer") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Rite2Rise
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed max-w-md text-lg">
                  Empowering communities through meaningful connections. Join us in creating positive change, one event
                  at a time.
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors group">
                    <Mail className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>hello@rite2rise.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors group">
                    <Phone className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors group">
                    <MapPin className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div
                className={`space-y-6 transition-all duration-800 delay-400 ease-out ${
                  visibleSections.has("footer") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: "About Us", href: "#" },
                    { name: "How It Works", href: "#" },
                    { name: "Browse Events", href: "/events" },
                    { name: "For Organizations", href: "#" },
                    { name: "Success Stories", href: "#" },
                    { name: "Help Center", href: "#" },
                  ].map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 flex items-center gap-2 group"
                      >
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social & Newsletter */}
              <div
                className={`space-y-6 transition-all duration-800 delay-600 ease-out ${
                  visibleSections.has("footer") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
              >
                <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Stay Connected
                </h4>

                {/* Social Links */}
                <div className="flex gap-4">
                  {[
                    { icon: Twitter, href: "#", color: "hover:text-blue-400" },
                    { icon: Instagram, href: "#", color: "hover:text-pink-400" },
                    { icon: Linkedin, href: "#", color: "hover:text-blue-600" },
                    { icon: Facebook, href: "#", color: "hover:text-blue-500" },
                    { icon: Github, href: "#", color: "hover:text-slate-600" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg group`}
                    >
                      <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>

                {/* Newsletter Signup */}
                <div className="space-y-3">
                  <p className="text-slate-600 text-sm">Get updates on new events and opportunities</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div
              className={`border-t border-slate-300 mt-12 pt-8 transition-all duration-800 delay-800 ease-out ${
                visibleSections.has("footer") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6 text-slate-600 text-sm">
                  <span>© 2024 Rite2Rise. All rights reserved.</span>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Terms of Service
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <span>Made with</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>for communities worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

