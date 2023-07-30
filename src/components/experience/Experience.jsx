import React from "react";
import "./experience.css";
import ExperienceItem from "./ExperienceItem";

const Experience = () => {
  const ExperienceArray = [
    {
      id: 1,
      date: "May 2023 - July 2023",
      title: "Software Developer Associate",
      position: "Internship",
      company: "Ikarus 3D",
      location: "Mohali (Punjab), India",
      description: {
        1: "Automated CI/CD workflow using GitHub Actions to handle web app linting, testing, building, and deployment.",
        2: "Containerized the application using Docker and deployed it on AWS using ECR and ECS.",
        3: "Implemented linting for Python (pylint, flake8, Black), JavaScript/TypeScript (ESLint), and CSS (Stylelint).",
        4: "Managed versioning in the CI/CD workflow.",
        5: "Conducted unit testing with Pytest (Python) and Jest (JavaScript).",
        6: "Deployed SonarQube on AWS EC2 from Amazon Marketplace, seamlessly integrated it into GitHub workflows, and utilized it for code analysis.",
        7: "Integrated SonarQube with Amazon RDS for seamless data storage and retrieval.",
        8: "Provisioned Forem, employing Ansible for infrastructure automation and deployment.",
        9: "Analyzed all features and explored the full potential of the Forem platform, gaining a deep understanding of its capabilities and functionalities.",
      },
      skills: [
        "Python",
        "JavaScript",
        "GitHub Actions",
        "Amazon EC2",
        "Docker",
        "AWS",
        "Ansible",
        "SonarQube",
        "Forem",
        "CI/CD",
        "Testing",
        "Linting",
        "DevOps",
        "Infrastructure Automation",
        "Deployment",
      ],
    },
  ];
  return (
    <section id="experience">
      <h5>What Qualifications I have</h5>
      <h2>My Experience</h2>
      <div className="container experience__container">
        {ExperienceArray.map((item) => {
          return <ExperienceItem item={item} />;
        })}
      </div>
    </section>
  );
};

export default Experience;
