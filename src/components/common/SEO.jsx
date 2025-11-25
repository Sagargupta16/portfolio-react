import React from 'react'
import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'

const SEO = ({ title, description, name, type }) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content={type} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  name: PropTypes.string,
  type: PropTypes.string
}

SEO.defaultProps = {
  title: 'Sagar Gupta - Portfolio',
  description: 'A dynamic and interactive React portfolio showcasing professional experience.',
  name: 'Sagar Gupta',
  type: 'website'
}

export default SEO
