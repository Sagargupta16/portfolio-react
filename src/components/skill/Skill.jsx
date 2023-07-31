import React from "react";
import "./skill.css";
import { BsPatchCheckFill } from "react-icons/bs";

const skills = {
  "Programming Languages": [
    "C++", "Python", "C", "Java", "R", "JavaScript", "SQL", "HTML", "CSS"
  ],
  "Frameworks and Libraries": [
    "React JS", "Node JS", "Express JS", "Mongo DB", "Bootstrap", "Material UI", "Fast-API", "Rest-API", "Pandas", "NumPy", "Matplotlib"
  ],
  "Cloud and Databases": [
    "AWS", "AWS EC2", "AWS ECR", "AWS RDS", "MongoDB", "MySQL"
  ],
  "Tools, Editors, and IDEs": [
    "Git", "VS Code", "Eclipse", "Jupyter Notebook", "Android Studio", "Docker", "Ansible", "SonarQube", "Github Actions", "Unity Engine"
  ],
  "Operating Systems": [
    "Windows", "Linux", "Android"
  ],
  "Soft Skills": [
    "Teamwork", "Leadership", "Communication", "Time Management", "Problem Solving", "Critical Thinking"
  ],
  "Coursework": [
    "Data Structures", "Object-Oriented Programming", "Web Development", "Game Development", "Database Management Systems", "Operating Systems", "Computer Networks", "Software Engineering", "Artificial Intelligence", "Cloud Computing"
  ],
  
  "Areas of Interest": [
    "Full Stack Development", "Web Development", "Game Development", "Cloud Computing", "Data Science", "DevOps"
  ]
};

function Skill() {
  return (
    <section id="skill">
      <h5>What Skills I Have</h5>
      <h2>My Skills</h2>
      <div className="container skill__container">
        {Object.keys(skills).map((skill, index) => (
          <div className="skill__card" key={index}>
            <h3 className="skill__title">{skill}</h3>
            <div className="skill__list">
              {skills[skill].map((item, index) => (
                <div key={index} className="skill__item">
                  <BsPatchCheckFill className="skill__icon" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skill;
