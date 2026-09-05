import { useEffect, lazy, Suspense, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import Nav from "@components/layout/Navigation/Nav";
import Hero from "@components/layout/Header/Hero";
import Footer from "@components/layout/Footer/Footer";
import AmbientBackground from "@components/layout/AmbientBackground";
import ErrorBoundary from "@components/common/ErrorBoundary";
import ScrollProgress from "@components/ui/ScrollProgress";
import BackToTop from "@components/ui/BackToTop";
import MotionPreferenceControl from "@components/ui/MotionPreferenceControl";
import SectionLoader from "@components/ui/SectionLoader";
import { BreakpointProvider } from "@hooks/BreakpointProvider";
import { MotionPreferenceProvider } from "@hooks/MotionPreferenceProvider";
import useMotionPreference from "@hooks/useMotionPreference";
import { CONTENT_SECTIONS } from "@/constants/sections";

const LENIS_OPTIONS = {
   lerp: 0.1,
   smoothWheel: true,
   wheelMultiplier: 1.1,
   touchMultiplier: 1.5,
   syncTouch: false,
   // Lenis defaults this to true and then makes every programmatic scroll
   // (nav links, footer links, Back to top) jump instantly whenever the OS
   // prefers reduced motion. Full mode means full motion; the in-app Reduced
   // mode (which unmounts Lenis entirely) is the only gate.
   respectReducedMotion: false,
};

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

const SECTION_COMPONENTS = {
   about: About,
   experience: Experience,
   education: Education,
   skills: Skill,
   projects: Portfolio,
   achievements: Achievement,
   services: Services,
   stats: GitHub,
   contact: Contact,
};

const SectionPlaceholder = ({
   id,
   label,
   failed = false,
}: {
   id: string;
   label: string;
   failed?: boolean;
}) => (
   <section
      id={id}
      aria-label={`${label} ${failed ? "unavailable" : "loading"}`}
      style={{ minHeight: "30vh", scrollMarginTop: 64 }}
   >
      {failed ? (
         <div
            role="alert"
            style={{
               maxWidth: 640,
               margin: "0 auto",
               padding: "96px 24px",
               textAlign: "center",
            }}
         >
            <h2>{label} is temporarily unavailable</h2>
            <p style={{ marginTop: 8, color: "var(--color-text-secondary)" }}>
               Refresh the page to try loading this section again.
            </p>
            <button
               type="button"
               className="btn-outline"
               onClick={() => globalThis.location.reload()}
               style={{ marginTop: 16 }}
            >
               Refresh page
            </button>
         </div>
      ) : (
         <SectionLoader />
      )}
   </section>
);

// Reduced mode hands scrolling back to the browser. With no Lenis instance,
// useLenis() returns undefined and the nav, hero, footer and BackToTop callers
// already fall back to native scrollIntoView / scrollTo.
const SmoothScroll = ({ children }: { children: ReactNode }) => {
   const { reducedMotion } = useMotionPreference();
   if (reducedMotion) return children;
   return (
      <ReactLenis root options={LENIS_OPTIONS}>
         {children}
      </ReactLenis>
   );
};

const AppContent = () => {
   return (
      <SmoothScroll>
         <ErrorBoundary>
            <ScrollProgress />
            <AmbientBackground />
            <div className="relative min-h-dvh">
               <a href="#main-content" className="skip-link">
                  Skip to content
               </a>
               <Nav />
               <main id="main-content" tabIndex={-1}>
                  <Hero />
                  {CONTENT_SECTIONS.map(({ id, label, surface }) => {
                     const Section = SECTION_COMPONENTS[id];
                     return (
                        <div key={id} className={surface}>
                           <ErrorBoundary
                              fallback={
                                 <SectionPlaceholder
                                    id={id}
                                    label={label}
                                    failed
                                 />
                              }
                           >
                              <Suspense
                                 fallback={
                                    <SectionPlaceholder id={id} label={label} />
                                 }
                              >
                                 <Section />
                              </Suspense>
                           </ErrorBoundary>
                        </div>
                     );
                  })}
               </main>
               <Footer />
               <BackToTop />
               <MotionPreferenceControl />
            </div>
         </ErrorBoundary>
      </SmoothScroll>
   );
};

const App = () => {
   useEffect(() => {
      globalThis.history.scrollRestoration = "manual";
      globalThis.scrollTo(0, 0);
   }, []);

   return (
      <BreakpointProvider>
         <MotionPreferenceProvider>
            <AppContent />
         </MotionPreferenceProvider>
      </BreakpointProvider>
   );
};

export default App;
