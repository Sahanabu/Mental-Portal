'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { Scene } from '@/three/Scene';
import Link from 'next/link';
import { gsap } from 'gsap';

// Register ScrollTrigger plugin only on client side
if (typeof window !== 'undefined') {
  import('gsap/ScrollTrigger').then((ScrollTrigger) => {
    gsap.registerPlugin(ScrollTrigger.ScrollTrigger);
  });
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        const progress = scrollTop / scrollHeight;
        setScrollProgress(progress);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    // Simple animations without ScrollTrigger for now
    const ctx = gsap.context(() => {
      // Hero section animation
      if (heroRef.current) {
        gsap.fromTo(heroRef.current, 
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.5 }
        );
      }

      // Stagger animations for other sections
      const sections = [section2Ref.current, section3Ref.current, ctaRef.current];
      sections.forEach((section, index) => {
        if (section) {
          gsap.fromTo(section,
            { opacity: 0, y: 50 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 1, 
              delay: 1 + (index * 0.3),
              ease: "power2.out" 
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);
  return (
    <div className="scene-container overflow-hidden bg-background relative">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ScrollControls pages={4} damping={0.2} maxSpeed={0.5}>
            <Scene scrollProgress={scrollProgress} />
          </ScrollControls>
        </Canvas>
      </div>
      
      <div ref={containerRef} className="relative z-10 h-screen overflow-y-auto pointer-events-auto" style={{ scrollBehavior: 'smooth' }}>
        {/* Page 1: Hero */}
        <section ref={heroRef} className="h-screen min-h-[calc(100vh_-_theme(space.14))] sm:min-h-[calc(100vh_-_theme(space.16))] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pt-8 sm:pt-16 md:pt-20 relative">

                <div className="glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] max-w-xs sm:max-w-2xl md:max-w-4xl text-center space-y-4 sm:space-y-6 md:space-y-8 backdrop-blur-2xl pointer-events-auto">
                  <h1 className="responsive-hero font-black tracking-tight text-primary drop-shadow-sm leading-tight">
                    Clarity for your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
                      Beautiful Mind
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light max-w-xs sm:max-w-xl md:max-w-2xl mx-auto">
                    A minimalist, immersive scroll-based experience to track, understand, and nurture your mental well-being.
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-primary animate-bounce mt-6 sm:mt-8 md:mt-10 hide-mobile">
                    Scroll down to explore
                  </p>
                  <p className="text-xs font-semibold text-primary mt-6 show-mobile">
                    Swipe up to explore
                  </p>
                </div>
              </section>

        {/* Page 2: Storytelling 1 */}
        <section ref={section2Ref} className="h-screen min-h-[calc(100vh_-_theme(space.14))] sm:min-h-[calc(100vh_-_theme(space.16))] flex items-center justify-start p-4 sm:p-6 md:p-8 md:pl-16 lg:pl-32 relative">

                <div className="space-y-4 sm:space-y-6 glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] max-w-xs sm:max-w-md lg:max-w-lg pointer-events-auto">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">Discover Patterns</h2>
                  <p className="responsive-text text-muted-foreground">
                    As you move forward, you uncover insights into what elevates your state of mind and what brings it down over time.
                  </p>
                </div>
              </section>

        {/* Page 3: Storytelling 2 */}
        <section ref={section3Ref} className="h-screen min-h-[calc(100vh_-_theme(space.14))] sm:min-h-[calc(100vh_-_theme(space.16))] flex items-center justify-end p-4 sm:p-6 md:p-8 md:pr-16 lg:pr-32 relative">

                <div className="space-y-4 sm:space-y-6 glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] max-w-xs sm:max-w-md lg:max-w-lg text-right pointer-events-auto">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-500">Daily Rituals</h2>
                  <p className="responsive-text text-muted-foreground">
                    Connect with yourself through tracked moods, guided breathing, and anonymous ambient relaxation spaces.
                  </p>
                </div>
              </section>

        {/* Page 4: Call to Action */}
        <section ref={ctaRef} className="h-screen min-h-[calc(100vh_-_theme(space.14))] sm:min-h-[calc(100vh_-_theme(space.16))] flex items-center justify-center p-4 sm:p-6 md:p-8 relative">

                <div className="glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] max-w-xs sm:max-w-2xl md:max-w-4xl text-center space-y-6 sm:space-y-8 w-full pointer-events-auto">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    A Safe, Private Space
                  </h2>
                  <p className="responsive-text text-muted-foreground mx-auto max-w-xs sm:max-w-xl md:max-w-2xl">
                    Take our guided PHQ-9 & GAD-7 based assessments completely anonymously, or create an account to save your journey.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-6 sm:pt-8">
                    <Link href="/auth">
                      <button className="w-full sm:w-auto touch-button bg-white text-primary border border-primary/20 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/assessment">
                      <button className="w-full sm:w-auto touch-button bg-primary text-primary-foreground rounded-full text-base sm:text-lg font-semibold hover:scale-105 transition-transform shadow-md cursor-pointer">
                        Try Anonymous
                      </button>
                    </Link>
                  </div>
                </div>
        </section>
      </div>
    </div>
  );
}
