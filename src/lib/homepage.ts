import { mkdir, readFile, writeFile, access } from 'fs/promises'
import path from 'path'

export interface HomepageConfig {
  heroImage: string
  featuredCollections: string[] // array of collection IDs, in display order
}

const HOMEPAGE_FILE = path.join(process.cwd(), 'data', 'homepage.json')

async function ensureDataDir(): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await access(dataDir)
  } catch {
    await mkdir(dataDir, { recursive: true })
  }
}

export async function loadHomepageConfig(): Promise<HomepageConfig> {
  try {
    await ensureDataDir()
    const data = await readFile(HOMEPAGE_FILE, 'utf-8')
    return JSON.parse(data) as HomepageConfig
  } catch {
    // Return defaults if file doesn't exist
    return {
      heroImage: '/images/image-hero1.webp',
      featuredCollections: [],
    }
  }
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<void> {
  await ensureDataDir()
  await writeFile(HOMEPAGE_FILE, JSON.stringify(config, null, 2), 'utf-8')
}

export async function updateHeroImage(imagePath: string): Promise<HomepageConfig> {
  const config = await loadHomepageConfig()
  config.heroImage = imagePath
  await saveHomepageConfig(config)
  return config
}

export async function addFeaturedCollection(collectionId: string): Promise<HomepageConfig> {
  const config = await loadHomepageConfig()
  if (!config.featuredCollections.includes(collectionId)) {
    config.featuredCollections.push(collectionId)
  }
  await saveHomepageConfig(config)
  return config
}

export async function removeFeaturedCollection(collectionId: string): Promise<HomepageConfig> {
  const config = await loadHomepageConfig()
  config.featuredCollections = config.featuredCollections.filter((id) => id !== collectionId)
  await saveHomepageConfig(config)
  return config
}

export async function reorderFeaturedCollections(orderedIds: string[]): Promise<HomepageConfig> {
  const config = await loadHomepageConfig()
  config.featuredCollections = orderedIds
  await saveHomepageConfig(config)
  return config
}
