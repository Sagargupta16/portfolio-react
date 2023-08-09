import React, { useState } from "react";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { IoLocationSharp } from "react-icons/io5";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";

const ExperienceItem = ({ item }) => {
  const [show, setShow] = useState(false);

  const toggleDropdown = () => {
    setShow(!show);
  };

  return (
    <div className="experience__item">
      <h3 className="experience__date">
        <span className="experience__date__icon">
          <BsFillCalendarEventFill />
          {item.date}
        </span>
        <div className="experience__dropdown" onClick={toggleDropdown}>
          <span className="experience__dropdown__icon">
            {show ? <CiCircleChevUp /> : <CiCircleChevDown />}
          </span>
          <span className="experience__dropdown__text">
            {show ? "Less" : "More"}
          </span>
        </div>
      </h3>
      <h4 className="experience__title">
        {item.title},
        <span className="experience__position"> {item.position}</span>
      </h4>
      <h3 className="experience__company">
        <span>{item.company}</span>
        <span className="experience__location">
          {item.location_type === "Remote" ? (
            <span className="experience__location__remote">
              {" "}
              ({item.location})
            </span>
          ) : (
            <span className="experience__location__inperson">
              <IoLocationSharp /> {item.location}
            </span>
          )}
        </span>
      </h3>
      <div className={`experience__item__description ${show ? "active" : ""}`}>
        <h4>What I did?</h4>
        <ul>
          {Object.values(item.description).map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
      </div>
      <div className={`experience__item__skills ${show ? "active" : ""}`}>
        <h4>Skills I Learned & Used!</h4>
        <div className="experience__item__skills__list">
          {item.skills.map((skill, index) => (
            <span key={index}>{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceItem;
