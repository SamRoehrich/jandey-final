import { mkdir, readFile, writeFile, access } from 'fs/promises'
import path from 'path'

export interface Tag {
  id: string
  title: string
  date: string
  description: string
  createdAt: string
}

const TAGS_FILE = path.join(process.cwd(), 'data', 'tags.json')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

async function ensureDataDir(): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await access(dataDir)
  } catch {
    await mkdir(dataDir, { recursive: true })
  }
}

export async function loadTags(): Promise<Tag[]> {
  try {
    await ensureDataDir()
    const data = await readFile(TAGS_FILE, 'utf-8')
    return JSON.parse(data) as Tag[]
  } catch {
    return []
  }
}

export async function saveTags(tags: Tag[]): Promise<void> {
  await ensureDataDir()
  await writeFile(TAGS_FILE, JSON.stringify(tags, null, 2), 'utf-8')
}

export async function createTag(
  title: string,
  date: string,
  description: string
): Promise<Tag> {
  const tags = await loadTags()

  // Create URL-friendly ID from title
  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Check if tag already exists
  if (tags.some((t) => t.id === id)) {
    throw new Error(`Tag "${title}" already exists`)
  }

  const newTag: Tag = {
    id,
    title,
    date,
    description,
    createdAt: new Date().toISOString(),
  }

  tags.push(newTag)
  await saveTags(tags)

  // Create the tag folder in images directory
  const tagFolderPath = path.join(IMAGES_DIR, id)
  await mkdir(tagFolderPath, { recursive: true })

  return newTag
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  const tags = await loadTags()
  return tags.find((t) => t.id === id)
}

export function getTagImagePath(tagId: string): string {
  return path.join(IMAGES_DIR, tagId)
}
