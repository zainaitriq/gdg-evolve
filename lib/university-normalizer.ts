// lib/university-normalizer.ts
export function normalizeUniversityName(university: string): string {
  if (!university) return university

  const normalized = university.trim().toLowerCase()
  
  // Al-Balqa Applied University variations
  if (
    normalized.includes('balqa') || 
    normalized === 'bau' || 
    normalized === 'ba' ||
    normalized.includes('albalqaa')
  ) {
    return 'Al-Balqa Applied University'
  }
  
  // Al-Hussein Technical University variations
  if (
    normalized.includes('hussein') && normalized.includes('technical') ||
    normalized === 'htu' ||
    normalized.includes('alhussien') ||
    normalized.includes('hussain')
  ) {
    return 'Al-Hussein Technical University'
  }
  
  // Amman Al-Ahliyya University variations
  if (
    normalized.includes('ahliyya') ||
    normalized.includes('ahlyyah') ||
    normalized === 'aau'
  ) {
    return 'Amman Al-Ahliyya University'
  }
  
  // The Hashemite University variations
  if (
    normalized === 'hu' ||
    normalized.includes('hashemite')
  ) {
    return 'The Hashemite University'
  }
  
  // Al-Zaytoonah University variations
  if (
    normalized.includes('zaytoon') ||
    normalized.includes('alzaytona') ||
    normalized === 'zuj' ||
    normalized.includes('زيتونة')
  ) {
    return 'Al-Zaytoonah University of Jordan'
  }
  
  // Jordan University of Science and Technology variations
  if (
    normalized === 'just' ||
    (normalized.includes('jordan') && normalized.includes('science') && normalized.includes('technology'))
  ) {
    return 'Jordan University of Science and Technology'
  }
  
  // University of Jordan variations
  if (
    (normalized.includes('university') && normalized.includes('jordan') && !normalized.includes('science')) ||
    normalized === 'ju'
  ) {
    return 'University of Jordan'
  }
  
  // Zarqa University variations
  if (
    normalized.includes('zarqa') ||
    normalized === 'zu' ||
    normalized.includes('زرقاء')
  ) {
    return 'Zarqa University'
  }
  
  // German Jordanian University variations
  if (
    normalized === 'gju' ||
    (normalized.includes('german') && normalized.includes('jordanian'))
  ) {
    return 'German Jordanian University'
  }
  
  // Return original if no match found (properly capitalized)
  return university.trim()
}
