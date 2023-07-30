import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/header/Header";
import Nav from "./components/nav/Nav";
import About from "./components/about/About";
import Education from "./components/education/Education";
import Experience from "./components/experience/Experience";
import Skill from "./components/skill/Skill";
import Services from "./components/services/Services";
import Portfolio from "./components/portfolio/Portfolio";
import Testimonial from "./components/testimonials/Testimonial";
import Contact from "./components/contact/Contact";
import Footer from "./components/footer/Footer";

const App = () => {
  const [screenWidth, setScreenWidth] = React.useState(window.screen.width);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.screen.width);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [screenWidth]);

  return (
    <>
      {screenWidth > 600 ? (
        <Router basename="/Portfolio-React">
          <Nav />
          <Routes>
            <Route exact path="/" element={<Header />}></Route>
            <Route path="/about" element={<About />}></Route>
            <Route path="/education" element={<Education />}></Route>
            <Route path="/experience" element={<Experience />}></Route>
            <Route path="/skill" element={<Skill />}></Route>
            <Route path="/services" element={<Services />}></Route>
            <Route path="/portfolio" element={<Portfolio />}></Route>
            <Route path="/testimonial" element={<Testimonial />}></Route>
            <Route path="/contact" element={<Contact />}></Route>
          </Routes>
          <Footer />
        </Router>
      ) : (
        <>
          <Header />
          <About />
          <Education />
          <Experience />
          <Skill />
          <Services />
          <Portfolio />
          <Testimonial />
          <Contact />
          <Footer />
        </>
      )}
    </>
  );
};

export default App;
