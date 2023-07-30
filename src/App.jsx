import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/header/Header";
import Nav from "./components/nav/Nav";
import About from "./components/about/About";
import Education from "./components/education/Education";
import Skill from "./components/skill/Skill";
import Services from "./components/services/Services";
import Portfolio from "./components/portfolio/Portfolio";
import Testimonial from "./components/testimonials/Testimonial";
import Contact from "./components/contact/Contact";
import Footer from "./components/footer/Footer";

const App = () => {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route exact path="portfolio-react/" element={<Header />}></Route>
        <Route path="portfolio-react/about" element={<About />}></Route>
        <Route path="portfolio-react/education" element={<Education />}></Route>
        <Route path="portfolio-react/skill" element={<Skill />}></Route>
        <Route path="portfolio-react/services" element={<Services />}></Route>
        <Route path="portfolio-react/portfolio" element={<Portfolio />}></Route>
        <Route path="portfolio-react/testimonial" element={<Testimonial />}></Route>
        <Route path="portfolio-react/contact" element={<Contact />}></Route>
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
