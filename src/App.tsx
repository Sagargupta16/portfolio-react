import { useEffect, useState, lazy, Suspense } from "react";
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
import SectionTransition from "@components/ui/SectionTransition";
import ParallaxElements from "@components/ui/ParallaxElements";
import AuroraBlobs from "@components/ui/AuroraBlobs";
import ShootingStars from "@components/ui/ShootingStars";
import InteractiveConstellation from "@components/ui/InteractiveConstellation";
import SystemStatus from "@components/ui/SystemStatus";
import { hasWebGL } from "@components/layout/Header/heroConstants";
import { BreakpointProvider } from "@hooks/BreakpointProvider";

// Global interactive 3D background, lazy-loaded so Three.js stays out of the
// initial bundle. Falls back to the 2D constellation when WebGL is unavailable.
const SceneBackground = lazy(() => import("@components/3d/SceneBackground"));

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
   const [webGLSupported] = useState(() => hasWebGL());

   useEffect(() => {
      globalThis.history.scrollRestoration = "manual";
      globalThis.scrollTo(0, 0);
   }, []);

   return (
      <ReactLenis
         root
         options={{
            duration: 1,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
         }}
      >
         <BreakpointProvider>
         <ErrorBoundary>
            <Preloader />
            <ScrollProgress />
            <KeyboardNav />
            <AuroraBlobs />
            <ShootingStars />
            {webGLSupported ? (
               <ErrorBoundary fallback={<InteractiveConstellation />}>
                  <Suspense fallback={null}>
                     <SceneBackground />
                  </Suspense>
               </ErrorBoundary>
            ) : (
               <InteractiveConstellation />
            )}
            <ParallaxElements />
            <div className="relative min-h-screen">
               <Nav />
               <main>
                  <Hero />
                  <Suspense fallback={<SectionLoader />}>
                     <SectionTransition variant="gradient-sweep" />
                     <div className="section-darker">
                        <About />
                     </div>
                     <SectionTransition variant="glow-pulse" />
                     <div className="section-dark">
                        <Experience />
                     </div>
                     <SectionTransition variant="beam" />
                     <div className="section-darker">
                        <Education />
                     </div>
                     <SectionTransition variant="geometric-scatter" />
                     <div className="section-dark">
                        <Skill />
                     </div>
                     <SectionTransition variant="gradient-sweep" />
                     <div className="section-darker" id="projects">
                        <Portfolio />
                     </div>
                     <SectionTransition variant="glow-pulse" />
                     <div className="section-dark" id="achievements">
                        <Achievement />
                     </div>
                     <SectionTransition variant="beam" />
                     <div className="section-darker" id="services">
                        <Services />
                     </div>
                     <SectionTransition variant="geometric-scatter" />
                     <div className="section-dark" id="github">
                        <GitHub />
                     </div>
                     <SectionTransition variant="gradient-sweep" />
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
