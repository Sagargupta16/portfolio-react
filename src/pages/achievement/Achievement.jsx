import React from 'react';
import achievementsData from '../../data/achievements.json';
import './achievement.css';

const Achievement = () => {
  const { certifications = [], achievements = [], coding_platform_stats = {} } = achievementsData;

  return (
    <div className="achievement-section">
      <h1>Achievements</h1>
      <section>
        <h2>Certifications</h2>
        <ul className="achievement-list">
          {certifications.map(cert => (
            <li key={cert.id} className="achievement-item">
              <h3>{cert.name}</h3>
              <p>Type: {cert.type}</p>
              <p>Issuer: {cert.issuer}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Competitions & Awards</h2>
        <ul className="achievement-list">
          {achievements.map(item => (
            <li key={item.id} className="achievement-item">
              <h3>{item.title}</h3>
              {item.organizer && <p>Organizer: {item.organizer}</p>}
              <p>Type: {item.type}</p>
              {item.certificate && <span className="achievement-date">Certificate Available</span>}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Coding Platform Stats</h2>
        <ul className="achievement-list">
          {Object.entries(coding_platform_stats).map(([platform, stats]) => (
            <li key={platform} className="achievement-item">
              <h3>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
              {Object.entries(stats).map(([k, v]) => (
                <p key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {v}</p>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Achievement;
