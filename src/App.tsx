import { useEffect, lazy, Suspense } from "react";
import { ReactLenis } from "lenis/react";
import Nav from "@components/layout/Navigation/Nav";
import Hero from "@components/layout/Header/Hero";
import Footer from "@components/layout/Footer/Footer";
import ErrorBoundary from "@components/common/ErrorBoundary";
import ScrollProgress from "@components/ui/ScrollProgress";
import BackToTop from "@components/ui/BackToTop";
import Preloader from "@components/ui/Preloader";
import KeyboardNav from "@components/ui/KeyboardNav";
import SectionLoader from "@components/ui/SectionLoader";
import SystemStatus from "@components/ui/SystemStatus";
import { BreakpointProvider } from "@hooks/BreakpointProvider";

// Lazy Load "Below the fold" sections for massive performance gains
const About = lazy(() => import("@pages/about/About"));
const Experience = lazy(() => import("@pages/experience/Experience"));
const Skill = lazy(() => import("@pages/skill/Skill"));
const Education = lazy(() => import("@pages/education/Education"));
const Services = lazy(() => import("@pages/services/Services"));
const Portfolio = lazy(() => import("@pages/portfolio/Portfolio"));
const Achievement = lazy(() => import("@pages/achievement/Achievement"));
const Contact = lazy(() => import("@pages/contact/Contact"));
const GitHub = lazy(() => import("@pages/github/GitHub"));

const App = () => {
   useEffect(() => {
      globalThis.history.scrollRestoration = "manual";
      globalThis.scrollTo(0, 0);
   }, []);

   return (
      <ReactLenis
         root
         options={{
            // lerp-based smoothing (not a fixed duration) so a fast flick
            // resolves quickly instead of being forced through a full 1s curve --
            // keeps scrolling smooth but responsive when the user scrolls hard.
            lerp: 0.1,
            wheelMultiplier: 1.1,
            touchMultiplier: 1.5,
            syncTouch: false,
         }}
      >
         <BreakpointProvider>
            <ErrorBoundary>
               <Preloader />
               <ScrollProgress />
               <KeyboardNav />
               <div className="relative min-h-screen">
                  <a href="#main-content" className="skip-link">
                     Skip to content
                  </a>
                  <Nav />
                  <main id="main-content" tabIndex={-1}>
                     <Hero />
                     <Suspense fallback={<SectionLoader />}>
                        <div className="section-darker">
                           <About />
                        </div>
                        <div className="section-dark">
                           <Experience />
                        </div>
                        <div className="section-darker">
                           <Education />
                        </div>
                        <div className="section-dark">
                           <Skill />
                        </div>
                        <div className="section-darker" id="projects">
                           <Portfolio />
                        </div>
                        <div className="section-dark" id="achievements">
                           <Achievement />
                        </div>
                        <div className="section-darker" id="services">
                           <Services />
                        </div>
                        <div className="section-dark" id="github">
                           <GitHub />
                        </div>
                        <div className="section-darker" id="contact">
                           <Contact />
                        </div>
                     </Suspense>
                  </main>
                  <Footer />
                  <BackToTop />
                  <SystemStatus />
               </div>
            </ErrorBoundary>
         </BreakpointProvider>
      </ReactLenis>
   );
};

export default App;
