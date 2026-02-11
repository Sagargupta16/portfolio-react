import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { getContactOptions, getEmailConfig } from '@data/dataLoader'
import { fadeInUp, staggerContainer } from '@utils/animations'
import SectionHeader from '@components/ui/SectionHeader'

const getIconForType = title => {
  if (title.toLowerCase().includes('email')) return Mail
  if (title.toLowerCase().includes('whatsapp')) return MessageCircle
  if (title.toLowerCase().includes('call')) return Phone
  return Mail
}

const Contact = () => {
  const formRef = useRef()
  const contactOptions = getContactOptions()
  const emailConfig = getEmailConfig()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = useCallback(e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setStatus({ type: '', message: '' })
  }, [])

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault()
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
      className="py-24 px-6"
      style={{ padding: '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <SectionHeader title="Get In Touch" subtitle="Let's work together" />

      <motion.div
        className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8"
        style={{ maxWidth: 896, margin: '0 auto', display: 'grid', gap: 32 }}
        variants={staggerContainer}
      >
        {/* Contact Options - Left Column */}
        <motion.div
          className="lg:col-span-2 space-y-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          variants={fadeInUp}
        >
          {contactOptions.map(option => {
            const IconComponent = getIconForType(option.title)

            return (
              <a
                key={option.id}
                href={option.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 flex items-center gap-4 block hover:border-accent-cyan/30 transition-all duration-300"
                style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
                aria-label={`${option.title}: ${option.value}`}
              >
                <div
                  className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(6,182,212,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <IconComponent className="w-5 h-5 text-accent-cyan" style={{ color: '#06b6d4' }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-text-muted text-xs uppercase tracking-wider font-medium"
                    style={{
                      color: '#6e6e90',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 500
                    }}
                  >
                    {option.title}
                  </p>
                  <p
                    className="text-text-primary text-sm font-medium truncate mt-0.5"
                    style={{ color: '#eeeef5', fontSize: 14, fontWeight: 500, marginTop: 2 }}
                  >
                    {option.value}
                  </p>
                </div>
              </a>
            )
          })}
        </motion.div>

        {/* Contact Form - Right Column */}
        <motion.div className="lg:col-span-3" variants={fadeInUp}>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="glass-card p-6 md:p-8 space-y-5"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              className="form-input resize-none"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>

            {status.message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm text-center font-medium ${
                  status.type === 'success' ? 'text-accent-green' : 'text-red-400'
                }`}
                style={
                  status.type === 'success'
                    ? { color: '#22c55e', fontSize: 14, textAlign: 'center', fontWeight: 500 }
                    : { color: '#ef4444', fontSize: 14, textAlign: 'center', fontWeight: 500 }
                }
              >
                {status.message}
              </motion.p>
            )}
          </form>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export default Contact
