import { Typewriter } from 'react-simple-typewriter'

const TW = ({ roles }) => {
  return <Typewriter words={roles} loop cursor cursorStyle="_" typeSpeed={70} deleteSpeed={50} delaySpeed={1000} />
}

export default TW
