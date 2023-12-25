import React from 'react'
import PropTypes from 'prop-types'
import { BsFillCalendarEventFill } from 'react-icons/bs'

const EducationItem = props => {
  const { item } = props
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
  )
}

export default EducationItem

EducationItem.propTypes = {
  item: PropTypes.shape({
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    cgpa: PropTypes.string.isRequired
  }).isRequired
}
