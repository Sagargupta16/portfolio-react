import React from "react";
import { BsFillCalendarEventFill } from "react-icons/bs";

const experienceitem = (props) => {
  const { item } = props;
  return (
    <div className="experience__item">
      <h3 className="experience__date">
        <BsFillCalendarEventFill />
        {item.date}
      </h3>
      <h4 className="experience__title">{item.title}</h4>
      <p className="experience__text">{item.text}</p>
      <p className="experience__text">{item.cgpa}</p>
    </div>
  );
};

export default experienceitem;
