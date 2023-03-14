import React from 'react'
import { GiCheckMark } from "react-icons/gi";

const serviceitem = (props) => {
  return (
    <article className="service">
      <div className="service__head">
        <h3>UI Design</h3>
      </div>
      <ul className="service__list">
        <li>
          <GiCheckMark className="service__list-icon" />
          <p>Responsive design</p>
        </li>
        <li>
          <GiCheckMark className="service__list-icon" />
          <p>Fast & Easy Navigation</p>
        </li>
        <li>
          <GiCheckMark className="service__list-icon" />
          <p>Modern UI design</p>
        </li>
        <li>
          <GiCheckMark className="service__list-icon" />
          <p>Animation effects</p>
        </li>
        <li>
          <GiCheckMark className="service__list-icon" />
          <p>Mobile design</p>
        </li>
      </ul>
    </article>
  );
}

export default serviceitem
