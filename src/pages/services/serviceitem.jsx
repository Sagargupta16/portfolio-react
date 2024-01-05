import React from 'react'
import { GiCheckMark } from 'react-icons/gi'

const serviceitem = props => {
  const { title, list } = props.item
  return (
    <article className="service">
      <div className="service__head">
        <h3>{title}</h3>
      </div>
      <ul className="service__list">
        {list.map(item => {
          return (
            <li key={item}>
              <GiCheckMark className="service__list-icon" />
              <p>{item}</p>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export default serviceitem
