import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { BsFillCalendarEventFill } from 'react-icons/bs'
import { IoLocationSharp } from 'react-icons/io5'
import { CiCircleChevDown, CiCircleChevUp } from 'react-icons/ci'

const ExperienceItem = ({ item }) => {
  const [show, setShow] = useState(false)

  const toggleDropdown = () => {
    setShow(!show)
  }

  return (
    <div className="experience__item">
      <h3 className="experience__date">
        <span className="experience__date__icon">
          <BsFillCalendarEventFill />
          {item.date}
        </span>
        <button className="experience__dropdown" onClick={toggleDropdown}>
          <span className="experience__dropdown__icon">{show ? <CiCircleChevUp /> : <CiCircleChevDown />}</span>
          <span className="experience__dropdown__text">{show ? 'Less' : 'More'}</span>
        </button>
      </h3>
      <h4 className="experience__title">
        {item.title},<span className="experience__position"> {item.position}</span>
      </h4>
      <h3 className="experience__company">
        <span>{item.company}</span>
        <span className="experience__location">
          {item.location === 'Remote' ? (
            <span className="experience__location__remote"> ({item.location})</span>
          ) : (
            <span className="experience__location__inperson">
              <IoLocationSharp /> {item.location}
            </span>
          )}
        </span>
      </h3>
      <div className={`experience__item__description ${show ? 'active' : ''}`}>
        <h4>My Contribution!</h4>
        <ul>
          {Object.values(item.description).map(desc => (
            <li key={`desc-${desc}`}>{desc}</li>
          ))}
        </ul>
      </div>
      <div className={`experience__item__skills ${show ? 'active' : ''}`}>
        <h4>Skills I Learned & Used!</h4>
        <div className="experience__item__skills__list">
          {item.skills.map(skill => (
            <span key={`skill-${skill}`}>{skill}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

ExperienceItem.propTypes = {
  item: PropTypes.shape({
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    description: PropTypes.objectOf(PropTypes.string).isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
}

export default ExperienceItem
