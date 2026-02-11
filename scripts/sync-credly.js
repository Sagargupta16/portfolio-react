#!/usr/bin/env node

/**
 * Fetches badges from Credly public API and updates achievements.json
 * with separated certifications and learning badges.
 *
 * Usage: node scripts/sync-credly.js
 *
 * Env: CREDLY_USERNAME (default: sagar-gupta.f8eb96cc)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = resolve(__dirname, '../src/data/achievements.json')
const CREDLY_USERNAME = process.env.CREDLY_USERNAME || 'sagar-gupta.f8eb96cc'
const API_URL = `https://www.credly.com/users/${CREDLY_USERNAME}/badges.json`

// Patterns that identify a full industry certification (not a learning badge)
const CERTIFICATION_PATTERNS = [/certified/i, /hashicorp certified/i, /terraform associate/i]

function isCertification(badgeName) {
  return CERTIFICATION_PATTERNS.some(p => p.test(badgeName))
}

function mapLevel(badge) {
  const name = badge.badge_template?.name || ''
  if (/professional/i.test(name)) return 'Professional'
  if (/associate/i.test(name)) return 'Associate'
  if (/foundational|practitioner/i.test(name)) return 'Foundational'
  return null
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return dateStr.slice(0, 10) // "2025-07-07T00:00:00.000+00:00" -> "2025-07-07"
}

function getIssuerName(badge) {
  const entities = badge.issuer?.entities || badge.badge_template?.issuer?.entities || []
  const primary = entities.find(e => e.primary) || entities[0]
  return primary?.entity?.name || 'Unknown'
}

function getBadgeType(badge) {
  const name = badge.badge_template?.name || ''
  if (isCertification(name)) return 'Industry Certification'
  if (/knowledge/i.test(name)) return 'Knowledge Badge'
  if (/partner/i.test(name)) return 'Partner Badge'
  if (/proficient|well-architected/i.test(name)) return 'Proficiency Badge'
  if (/educate/i.test(name)) return 'Learning Badge'
  if (/intermediate|foundational.*l[12]\d{2}/i.test(name)) return 'Training Badge'
  return 'Training Badge'
}

function transformBadge(badge, id) {
  const name = badge.badge_template?.name || ''
  const type = getBadgeType(badge)
  const entry = {
    id,
    name,
    type,
    issuer: getIssuerName(badge),
    issueDate: formatDate(badge.issued_at_date || badge.issued_at),
    credentialId: badge.id,
    credentialUrl: `https://www.credly.com/badges/${badge.id}`
  }

  const level = mapLevel(badge)
  if (level) entry.level = level

  const expiry = formatDate(badge.expires_at_date || badge.expires_at)
  if (expiry) entry.expiryDate = expiry

  const imageUrl = badge.image_url || badge.image?.url || badge.badge_template?.image?.url
  if (imageUrl) entry.imageUrl = imageUrl

  return entry
}

async function fetchBadges() {
  console.log(`Fetching badges from ${API_URL}`)
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`Credly API returned ${res.status}: ${res.statusText}`)
  const json = await res.json()
  // API returns { data: [...] } or plain array
  return json.data || json
}

async function main() {
  const badges = await fetchBadges()
  console.log(`Fetched ${badges.length} badges from Credly`)

  // Separate certifications from learning badges
  const certifications = []
  const learningBadges = []
  let certId = 1
  let badgeId = 1

  // Sort by issue date descending (newest first)
  const sorted = [...badges].sort((a, b) => {
    const dateA = a.issued_at_date || a.issued_at || ''
    const dateB = b.issued_at_date || b.issued_at || ''
    return dateB.localeCompare(dateA)
  })

  for (const badge of sorted) {
    const name = badge.badge_template?.name || ''
    // Skip retired badges
    if (badge.state === 'revoked') continue

    if (isCertification(name)) {
      certifications.push(transformBadge(badge, certId++))
    } else {
      learningBadges.push(transformBadge(badge, badgeId++))
    }
  }

  console.log(`  Certifications: ${certifications.length}`)
  console.log(`  Learning badges: ${learningBadges.length}`)

  // Read existing data to preserve achievements and coding stats
  let existing = {}
  try {
    existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
  } catch {
    console.log('No existing achievements.json found, creating new one')
  }

  const updated = {
    certifications,
    learning_badges: learningBadges,
    achievements: existing.achievements || [],
    coding_platform_stats: existing.coding_platform_stats || {}
  }

  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf8')
  console.log(`Updated ${DATA_PATH}`)

  // Summary
  console.log('\n--- Certifications ---')
  for (const c of certifications) {
    console.log(`  ${c.name} (${c.issuer}) - ${c.issueDate}`)
  }
  console.log('\n--- Learning Badges ---')
  for (const b of learningBadges) {
    console.log(`  ${b.name} (${b.issuer}) - ${b.issueDate}`)
  }
}

main().catch(err => {
  console.error('Failed to sync Credly badges:', err.message)
  process.exit(1)
})
