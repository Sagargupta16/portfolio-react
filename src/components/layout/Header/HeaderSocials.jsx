import { useCallback } from 'react'
import { socialProfiles, codingProfiles } from './Profiles'

const HeaderSocials = () => {
  const renderSocialLinks = useCallback(profiles => {
    return profiles.map((profile, index) => (
      <a
        key={profile.id || `profile-${index}`}
        href={profile.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${profile.name} profile`}
      >
        {profile.icon}
      </a>
    ))
  }, [])

  return (
    <div className="header__socials">
      <div className="header__socials__left">{renderSocialLinks(socialProfiles)}</div>
      <div className="header__socials__right">{renderSocialLinks(codingProfiles)}</div>
    </div>
  )
}

export default HeaderSocials
