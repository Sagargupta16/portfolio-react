import { lazy, Suspense, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import Nav from "@components/layout/Navigation/Nav";
import Hero from "@components/layout/Header/Hero";
import Footer from "@components/layout/Footer/Footer";
import AmbientBackground from "@components/layout/AmbientBackground";
import DeferredSection from "@components/layout/DeferredSection";
import ErrorBoundary from "@components/common/ErrorBoundary";
import ScrollProgress from "@components/ui/ScrollProgress";
import BackToTop from "@components/ui/BackToTop";
import MotionPreferenceControl from "@components/ui/MotionPreferenceControl";
import { BreakpointProvider } from "@hooks/BreakpointProvider";
import { MotionPreferenceProvider } from "@hooks/MotionPreferenceProvider";
import { SectionNavigationProvider } from "@hooks/SectionNavigationProvider";
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
   // mode (which unmounts the Lenis instance) is the only gate.
   respectReducedMotion: false,
};

// Site-wide floating stack field (>= 1280px). Lazy so the skill glyph
// registry stays out of the entry bundle.
const StackFieldBackdrop = lazy(
   () => import("@components/layout/StackFieldBackdrop"),
);

/* Truthy on purpose: ErrorBoundary treats a falsy fallback as "not provided"
   and renders its full "Something went wrong" panel. A failed field chunk
   should leave the flanks empty, not replace the page. */
const OMIT_BACKDROP = <></>;

// DeferredSection renders these only near the viewport or on navigation.
const About = lazy(() => import("@pages/about/About"));
const Experience = lazy(() => import("@pages/experience/Experience"));
const Skill = lazy(() => import("@pages/skill/Skill"));
const Education = lazy(() => import("@pages/education/Education"));
const Services = lazy(() => import("@pages/services/Services"));
const Projects = lazy(() => import("@pages/projects/Projects"));
const Achievement = lazy(() => import("@pages/achievement/Achievement"));
const Contact = lazy(() => import("@pages/contact/Contact"));
const Stats = lazy(() => import("@pages/stats/Stats"));

const SECTION_COMPONENTS = {
   about: About,
   experience: Experience,
   education: Education,
   skills: Skill,
   projects: Projects,
   achievements: Achievement,
   services: Services,
   stats: Stats,
   contact: Contact,
};

// Lenis exposes its root instance to sibling useLenis consumers. Keeping it
// beside the page lets Reduced destroy scrolling without remounting content.
const SmoothScroll = ({ children }: { children: ReactNode }) => {
   const { reducedMotion } = useMotionPreference();
   return (
      <>
         {!reducedMotion && <ReactLenis root options={LENIS_OPTIONS} />}
         {children}
      </>
   );
};

const AppContent = () => {
   return (
      <SmoothScroll>
         <SectionNavigationProvider>
            <ErrorBoundary>
               <ScrollProgress />
               <AmbientBackground />
               {/* Fixed at z-0 before the page wrapper in DOM order: above the
                ambient glows (z -1), below every section (painted later). */}
               <ErrorBoundary fallback={OMIT_BACKDROP}>
                  <Suspense fallback={null}>
                     <StackFieldBackdrop />
                  </Suspense>
               </ErrorBoundary>
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
                           <DeferredSection
                              key={id}
                              id={id}
                              label={label}
                              surface={surface}
                           >
                              <Section />
                           </DeferredSection>
                        );
                     })}
                  </main>
                  {/* A footer failure must never reach the root boundary and blank the page. */}
                  <ErrorBoundary fallback={<></>}>
                     <Footer />
                  </ErrorBoundary>
                  <BackToTop />
                  <MotionPreferenceControl />
               </div>
            </ErrorBoundary>
         </SectionNavigationProvider>
      </SmoothScroll>
   );
};

const App = () => (
   <BreakpointProvider>
      <MotionPreferenceProvider>
         <AppContent />
      </MotionPreferenceProvider>
   </BreakpointProvider>
);

export default App;
