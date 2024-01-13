import React from 'react'
import { socialProfiles, codingProfiles } from './profiles'

const HeaderSocials = () => {
  const renderSocialLinks = profiles => {
    return profiles.map(profile => (
      <a key={profile.id} href={profile.link} target="_blank" rel="noreferrer" alt={profile.name}>
        {profile.icon}
      </a>
    ))
  }

  return (
    <div className="header__socials">
      <div className="header__socials__left">{renderSocialLinks(socialProfiles)}</div>
      <div className="header__socials__right">{renderSocialLinks(codingProfiles)}</div>
    </div>
  )
}

export default HeaderSocials
