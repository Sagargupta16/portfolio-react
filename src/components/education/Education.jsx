import React from "react";
import "./education.css";
import EducationItem from "./EducationItem.jsx";

const EducationArray = [
  {
    id: 1,
    date: "2021 - 2024",
    title: "Master's in Computer Applications (MCA)",
    text: "National Institute of Technology Warangal -- Warangal , Telangana",
    cgpa: "CGPA: 8.47 (Till Sem-3)",
  },
  {
    id: 2,
    date: "2018 - 2021",
    title: "Bachelor's in Computer Applications (BCA)",
    text: "Sanskar College Of Professional Studies (DAVV University) -- Indore , MP",
    cgpa: "CGPA: 7.34",
  },
  {
    id: 3,
    date: "2016 - 2018",
    title: "Higher Secondary School (PCM+PE)",
    text: "Happy Days School -- Shivpuri , MP",
    cgpa: "CGPA: 8.59",
  },
  {
    id: 4,
    date: "2014 - 2016",
    title: "High School",
    text: "Kids Garden School -- Shivpuri , MP",
    cgpa: "CGPA: 7.40",
  },
];

const Education = () => {
  return (
    <section id="education">
      <h5>What Qualifications I have</h5>
      <h2>My Education</h2>
      <div className="container education__container">
        {EducationArray.map((item) => {
          return <EducationItem item={item} />;
        })}
      </div>
    </section>
  );
};

export default Education;
