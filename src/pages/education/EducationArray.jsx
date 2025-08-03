import { getEducation } from '../../data/dataLoader'

// Transform the JSON data to match the expected format
const educationData = getEducation()
const educationArray = educationData.map(edu => ({
  id: edu.id,
  date: edu.date,
  title: edu.title,
  text: edu.display_text,
  cgpa: `CGPA: ${edu.cgpa}`
}))

export default educationArray
