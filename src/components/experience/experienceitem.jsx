import React, { useState } from "react";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { IoLocationSharp } from "react-icons/io5";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";

const ExperienceItem = (props) => {
  const [show, setShow] = useState(false);
  const { item } = props;

  const dropdown = () => {
    setShow(!show);
  };

  return (
    <div className="experience__item">
      <h3 className="experience__date">
        <span className="experience__date__icon">
          <BsFillCalendarEventFill />
          {item.date}
        </span>
        {show ? (
          <div className="experience__dropdown" onClick={dropdown}>
            <span className="experience__dropdown__icon">
              <CiCircleChevUp />
            </span>
            <span className="experoence__dropdown__text">Less</span>
          </div>
        ) : (
          <div className="experience__dropdown" onClick={dropdown}>
            <span className="experience__dropdown__icon">
              <CiCircleChevDown />
            </span>
            <span className="experoence__dropdown__text">More</span>
          </div>
        )}
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
          {Object.keys(item.description).map((key) => {
            return <li key={key}>{item.description[key]}</li>;
          })}
        </ul>
      </div>
      <div className={`experience__item__skills ${show ? "active" : ""}`}>
        <h4>Skills I Learned & Used!</h4>
        <div className="experience__item__skills__list">
          {item.skills.map((skill) => {
            return <span key={skill}>{skill}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

export default ExperienceItem;
