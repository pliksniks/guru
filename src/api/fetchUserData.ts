import { getStats } from 'osrs-json-hiscores'

export async function fetchUserData(username: string) {
  const stats = await getStats(username)
  return stats
}

export async function isLevelThree(stats: any) {
  const attack = stats.main.skills.attack.level
  const strength = stats.main.skills.strength.level
  const defence = stats.main.skills.defence.level
  const hitpoints = stats.main.skills.hitpoints.level
  const prayer = stats.main.skills.prayer.level
  const magic = stats.main.skills.magic.level
  const ranged = stats.main.skills.ranged.level

  if (
    attack === 1 ||
    strength === 1 ||
    defence === 1 ||
    hitpoints <= 10 ||
    prayer === 1 ||
    magic === 1 ||
    ranged === 1
  ) {
    return true
  }
  return false
}
