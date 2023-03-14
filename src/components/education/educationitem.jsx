import React from 'react'
import { BsFillCalendarEventFill } from "react-icons/bs";

const educationitem = (props) => {
    const {item} = props;
  return (
      <div className="education__item">
        <h3 className="education__date">
          <BsFillCalendarEventFill />
          {item.date}
        </h3>
        <h4 className="education__title">{item.title}</h4>
        <p className="education__text">{item.text}</p>
        <p className="education__text">{item.cgpa}</p>
      </div>
  );
}

export default educationitem
