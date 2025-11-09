import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { MdOutlineEmail } from 'react-icons/md'
import { ImWhatsapp } from 'react-icons/im'
import { IoCallOutline } from 'react-icons/io5'
import { fadeInUp, hoverScale, staggerContainer, staggerItem } from '../../utils/animations'
import './contact.css'

const Contact = () => {
  const form = useRef()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [feedbackHTML, setFeedbackHTML] = useState('')

  useEffect(() => {
    // Only clear messages after they are set, not on mount
    if (Object.keys(errors).length > 0 || successMessage || feedbackHTML) {
      const feedbackTimer = setTimeout(() => {
        setErrors({})
        setSuccessMessage('')
        setFeedbackHTML('')
      }, 5000)
      return () => clearTimeout(feedbackTimer)
    }
  }, [errors, successMessage, feedbackHTML])

  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    if (formData.name.length < 3 || formData.name.length > 30) {
      newErrors.name = 'Name should be between 3 and 30 characters'
      isValid = false
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters'
      isValid = false
    }

    setErrors(newErrors)

    setFeedbackHTML(() =>
      Object.keys(newErrors).map(key => (
        <p key={key} className="error">
          {newErrors[key]}
        </p>
      ))
    )

    return isValid
  }

  const sendEmail = async e => {
    e.preventDefault()

    setErrors({}) // Clear previous errors

    if (validateForm()) {
      try {
        const result = await emailjs.sendForm('service_lyt547p', 'template_yz438w6', form.current, 'PAcL61ygLI8WYG16R')
        if (result.status === 200) {
          setSuccessMessage('Message sent successfully!')
        }
      } catch {
        setErrors({
          general: 'Error sending message. Please try again later.'
        })
      }

      e.target.reset()
      setFormData({
        name: '',
        email: '',
        message: ''
      })
    }
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    setErrors({
      ...errors,
      [name]: undefined,
      general: undefined
    })
    setSuccessMessage('')
  }

  return (
    <motion.section
      id="contact"
      className="section contact-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.h5 className="section__subtitle" variants={fadeInUp}>
        Get In Touch
      </motion.h5>
      <motion.h2 className="section__title" variants={fadeInUp}>
        Contact Me
      </motion.h2>
      <motion.div
        className="container contact__container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div className="contact__options" variants={staggerContainer}>
          {[
            {
              id: 1,
              icon: <MdOutlineEmail className="contact__icon" />,
              title: 'Email Me',
              value: 'sg85207@gmail.com',
              link: 'mailto:sg85207@gmail.com',
              message: 'Send a Mail'
            },
            {
              id: 2,
              icon: <ImWhatsapp className="contact__icon" />,
              title: 'WhatsApp Me',
              value: '+91-8770532413',
              link: 'https://wa.me/+918770532413',
              message: 'Send a Message'
            },
            {
              id: 3,
              icon: <IoCallOutline className="contact__icon" />,
              title: 'Call me',
              value: '+91-8770532413',
              link: 'tel:+918770532413',
              message: 'Call Now'
            }
          ].map((option, index) => (
            <motion.article
              className="contact__option"
              key={option.id}
              variants={staggerItem}
              whileHover="hover"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h4>
                {option.icon}
                {option.title}
              </h4>
              <h5>{option.value}</h5>
              <motion.a
                href={option.link}
                target="_blank"
                rel="noreferrer"
                variants={hoverScale}
                whileHover="hover"
                whileTap="tap"
              >
                {option.message}
              </motion.a>
            </motion.article>
          ))}
        </motion.div>
        <motion.form
          ref={form}
          onSubmit={sendEmail}
          className="contact__form"
          variants={staggerItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.input
            type="text"
            name="name"
            placeholder="Your Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            whileFocus={{ scale: 1.02, borderColor: '#4db5ff' }}
            transition={{ duration: 0.2 }}
          />
          <motion.input
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            whileFocus={{ scale: 1.02, borderColor: '#4db5ff' }}
            transition={{ duration: 0.2 }}
          />
          <motion.textarea
            name="message"
            rows="7"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleInputChange}
            required
            whileFocus={{ scale: 1.02, borderColor: '#4db5ff' }}
            transition={{ duration: 0.2 }}
          />
          <motion.button type="submit" variants={hoverScale} whileHover="hover" whileTap="tap">
            Send Message
          </motion.button>
          {feedbackHTML && <div className="feedback-container">{feedbackHTML}</div>}
          {successMessage && <p className="success">{successMessage}</p>}
        </motion.form>
      </motion.div>
    </motion.section>
  )
}

export default Contact
