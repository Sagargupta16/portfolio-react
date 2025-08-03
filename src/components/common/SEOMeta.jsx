import { useEffect } from 'react'
import PropTypes from 'prop-types'

const SEOMeta = ({ 
  title = 'Portfolio - Sagar Gupta', 
  description = 'Dynamic React portfolio showcasing DevOps & Cloud Engineering expertise at AWS',
  keywords = 'React, Portfolio, DevOps, AWS, Cloud Engineer, JavaScript, TypeScript',
  author = 'Sagar Gupta',
  url = 'https://sagargupta.live/portfolio-react',
  image = '/portfolio-react/static/media/me.png'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const newMetaDescription = document.createElement('meta')
      newMetaDescription.name = 'description'
      newMetaDescription.content = description
      document.head.appendChild(newMetaDescription)
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords)
    } else {
      const newMetaKeywords = document.createElement('meta')
      newMetaKeywords.name = 'keywords'
      newMetaKeywords.content = keywords
      document.head.appendChild(newMetaKeywords)
    }

    // Update meta author
    const metaAuthor = document.querySelector('meta[name="author"]')
    if (metaAuthor) {
      metaAuthor.setAttribute('content', author)
    } else {
      const newMetaAuthor = document.createElement('meta')
      newMetaAuthor.name = 'author'
      newMetaAuthor.content = author
      document.head.appendChild(newMetaAuthor)
    }

    // Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', title)
    } else {
      const newOgTitle = document.createElement('meta')
      newOgTitle.setAttribute('property', 'og:title')
      newOgTitle.content = title
      document.head.appendChild(newOgTitle)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', description)
    } else {
      const newOgDescription = document.createElement('meta')
      newOgDescription.setAttribute('property', 'og:description')
      newOgDescription.content = description
      document.head.appendChild(newOgDescription)
    }

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', url)
    } else {
      const newOgUrl = document.createElement('meta')
      newOgUrl.setAttribute('property', 'og:url')
      newOgUrl.content = url
      document.head.appendChild(newOgUrl)
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
      ogImage.setAttribute('content', image)
    } else {
      const newOgImage = document.createElement('meta')
      newOgImage.setAttribute('property', 'og:image')
      newOgImage.content = image
      document.head.appendChild(newOgImage)
    }

    // Twitter Card meta tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    if (!twitterCard) {
      const newTwitterCard = document.createElement('meta')
      newTwitterCard.name = 'twitter:card'
      newTwitterCard.content = 'summary_large_image'
      document.head.appendChild(newTwitterCard)
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title)
    } else {
      const newTwitterTitle = document.createElement('meta')
      newTwitterTitle.name = 'twitter:title'
      newTwitterTitle.content = title
      document.head.appendChild(newTwitterTitle)
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description)
    } else {
      const newTwitterDescription = document.createElement('meta')
      newTwitterDescription.name = 'twitter:description'
      newTwitterDescription.content = description
      document.head.appendChild(newTwitterDescription)
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', image)
    } else {
      const newTwitterImage = document.createElement('meta')
      newTwitterImage.name = 'twitter:image'
      newTwitterImage.content = image
      document.head.appendChild(newTwitterImage)
    }

  }, [title, description, keywords, author, url, image])

  return null
}

SEOMeta.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  author: PropTypes.string,
  url: PropTypes.string,
  image: PropTypes.string
}

export default SEOMeta
