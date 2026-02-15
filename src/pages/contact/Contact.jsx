import { useRef, useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { Mail, Calendar, Send, ArrowUpRight } from 'lucide-react'
import Toast from '@components/ui/Toast'
import { getContactOptions, getEmailConfig } from '@data/dataLoader'
import { fadeInUp, staggerContainer, staggerItem } from '@utils/animations'
import useMediaQuery from '@utils/useMediaQuery'
import SectionHeader from '@components/ui/SectionHeader'

const LinkedinIcon = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const InstagramIcon = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

const GitHubIcon = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

const iconStylePropTypes = { style: PropTypes.object }
LinkedinIcon.propTypes = iconStylePropTypes
InstagramIcon.propTypes = iconStylePropTypes
GitHubIcon.propTypes = iconStylePropTypes

const CONTACT_COLORS = {
  email: { accent: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.15)' },
  linkedin: { accent: '#0a66c2', bg: 'rgba(10,102,194,0.08)', border: 'rgba(10,102,194,0.15)' },
  instagram: { accent: '#e1306c', bg: 'rgba(225,48,108,0.08)', border: 'rgba(225,48,108,0.15)' },
  calendar: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
  github: { accent: '#a5a5c0', bg: 'rgba(165,165,192,0.08)', border: 'rgba(165,165,192,0.15)' }
}

const getContactMeta = title => {
  const t = title.toLowerCase()
  if (t.includes('email')) return { Icon: Mail, colors: CONTACT_COLORS.email }
  if (t.includes('linkedin')) return { Icon: LinkedinIcon, colors: CONTACT_COLORS.linkedin }
  if (t.includes('instagram')) return { Icon: InstagramIcon, colors: CONTACT_COLORS.instagram }
  if (t.includes('book') || t.includes('call')) return { Icon: Calendar, colors: CONTACT_COLORS.calendar }
  if (t.includes('github')) return { Icon: GitHubIcon, colors: CONTACT_COLORS.github }
  return { Icon: Mail, colors: CONTACT_COLORS.email }
}

const Contact = () => {
  const formRef = useRef()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const contactOptions = getContactOptions()
  const emailConfig = getEmailConfig()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (status.type) {
      setToastVisible(true)
      const timer = setTimeout(() => {
        setToastVisible(false)
        setTimeout(() => setStatus({ type: '', message: '' }), 300)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [status.type])

  const handleChange = useCallback(
    e => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
      if (status.message) setStatus({ type: '', message: '' })
    },
    [status.message]
  )

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault()

      // Honeypot check — if the hidden field has a value, it's a bot
      const honeypot = formRef.current.querySelector('[name="website"]')
      if (honeypot?.value) return

      setIsLoading(true)
      setStatus({ type: '', message: '' })

      try {
        const result = await emailjs.sendForm(
          emailConfig.service_id,
          emailConfig.template_id,
          formRef.current,
          emailConfig.public_key
        )

        if (result.status === 200) {
          setStatus({ type: 'success', message: 'Message sent successfully!' })
          setFormData({ name: '', email: '', message: '' })
          formRef.current.reset()
        }
      } catch {
        setStatus({
          type: 'error',
          message: 'Failed to send message. Please try again.'
        })
      } finally {
        setIsLoading(false)
      }
    },
    [emailConfig]
  )

  return (
    <motion.section
      id="contact"
      style={{ padding: isMobile ? '64px 16px' : '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <SectionHeader title="Get In Touch" subtitle="Let's work together" />

      <motion.div
        style={{
          maxWidth: 896,
          margin: '0 auto',
          display: 'grid',
          gap: isMobile ? 24 : 32,
          gridTemplateColumns: isMobile ? '1fr' : '2fr 3fr'
        }}
        variants={staggerContainer}
      >
        {/* Contact Options - Left Column */}
        <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} variants={staggerContainer}>
          {contactOptions.map(option => {
            const { Icon, colors } = getContactMeta(option.title)

            return (
              <motion.a
                key={option.id}
                href={option.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={staggerItem}
                className="glass-card"
                style={{
                  padding: isMobile ? '16px 14px' : '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  borderLeft: `3px solid ${colors.accent}`,
                  borderRadius: '0 16px 16px 0',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                aria-label={`${option.title}: ${option.value}`}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon style={{ width: 20, height: 20, color: colors.accent }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      color: '#6e6e90',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 600
                    }}
                  >
                    {option.title}
                  </p>
                  <p
                    style={{
                      color: '#eeeef5',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {option.value}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: colors.accent,
                    fontSize: 12,
                    fontWeight: 500,
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {!isMobile && option.message}
                  <ArrowUpRight style={{ width: 14, height: 14 }} />
                </div>
              </motion.a>
            )
          })}
        </motion.div>

        {/* Contact Form - Right Column */}
        <motion.div variants={fadeInUp}>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="glass-card"
            style={{
              padding: isMobile ? '20px 18px' : '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {/* Honeypot — hidden from humans, bots fill it */}
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label
                htmlFor="contact-name"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#a5a5c0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8
                }}
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#a5a5c0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8
                }}
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#a5a5c0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8
                }}
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={isMobile ? 4 : 5}
                placeholder="Tell me about your project or idea..."
                value={formData.message}
                onChange={handleChange}
                required
                className="form-input"
                style={{ resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              aria-label={isLoading ? 'Sending message...' : 'Send message'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }}
                />
              ) : (
                <>
                  <Send style={{ width: 16, height: 16 }} />
                  Send Message
                </>
              )}
            </button>
          </form>

          {/* Glass toast notification */}
          <Toast
            message={status.message || ''}
            type={status.type || 'success'}
            visible={toastVisible}
            onClose={() => {
              setToastVisible(false)
              setTimeout(() => setStatus({ type: '', message: '' }), 300)
            }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export default Contact
