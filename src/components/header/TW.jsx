import React from 'react'
import { Typewriter } from 'react-simple-typewriter'
import 'react-simple-typewriter/dist/index'
import PropTypes from 'prop-types' // Import PropTypes

const TW = ({ words }) => {
  // Destructure words from props
  return (
    <Typewriter
      words={words}
      loop
      cursor
      cursorStyle="_"
      typeSpeed={70}
      deleteSpeed={50}
      delaySpeed={1000}
    />
  )
}

TW.propTypes = {
  words: PropTypes.arrayOf(PropTypes.string).isRequired // Define PropTypes for words
}

export default TW
