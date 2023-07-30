import React from "react";
import "./experience.css";
import { GoDot } from "react-icons/go";
import ExperienceItem from "./experienceitem";

const ExperienceArray = [
  {
    id: 1,
    date: "May 2023 - July 2023",
    title: "Software Developer Associate Intern",
    text: "At Ikarus 3D , Mohali , Punjab", 
    cgpa: "CGPA: 8.47 (Till Sem-3)",
  }
];

const Experience = () => {
  return (
    <section id="experience">
      <h5>What Qualifications I have</h5>
      <h2>My Experience</h2>
      <div className="container experience__container">
        {ExperienceArray.map((item) => {
          return (
            <>
              <GoDot />
              <ExperienceItem item={item} />
            </>
          );
        })}
      </div>
    </section>
  );
};

export default Experience;
