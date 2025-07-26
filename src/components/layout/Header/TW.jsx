import React from 'react'
import { Typewriter } from 'react-simple-typewriter'
import 'react-simple-typewriter/dist/index'
import PropTypes from 'prop-types'

const TW = ({ roles }) => {
  return <Typewriter words={roles} loop cursor cursorStyle="_" typeSpeed={70} deleteSpeed={50} delaySpeed={1000} />
}

TW.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default TW
