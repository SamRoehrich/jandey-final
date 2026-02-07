import { mkdir, readFile, writeFile, access, readdir, rm } from 'fs/promises'
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

export async function updateTag(
  id: string,
  title: string,
  date: string,
  description: string
): Promise<Tag> {
  const tags = await loadTags()
  const tagIndex = tags.findIndex((t) => t.id === id)
  
  if (tagIndex === -1) {
    throw new Error(`Tag with id "${id}" not found`)
  }
  
  // If title changed, we need to rename the folder
  const oldTag = tags[tagIndex]
  const newId = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  if (newId !== oldTag.id) {
    // Check if new ID already exists
    if (tags.some((t) => t.id === newId && t.id !== id)) {
      throw new Error(`A collection with the title "${title}" already exists`)
    }
    
    // Rename the folder
    const oldFolderPath = path.join(IMAGES_DIR, oldTag.id)
    const newFolderPath = path.join(IMAGES_DIR, newId)
    
    try {
      await access(oldFolderPath)
      await Bun.$`mv ${oldFolderPath} ${newFolderPath}`
    } catch {
      // Folder might not exist, that's okay
    }
  }
  
  // Update the tag
  tags[tagIndex] = {
    ...oldTag,
    id: newId,
    title,
    date,
    description,
  }
  
  await saveTags(tags)
  return tags[tagIndex]
}

export async function deleteTag(id: string): Promise<void> {
  const tags = await loadTags()
  const tagIndex = tags.findIndex((t) => t.id === id)
  
  if (tagIndex === -1) {
    throw new Error(`Tag with id "${id}" not found`)
  }
  
  // Delete the tag folder and all its images
  const tagFolderPath = path.join(IMAGES_DIR, id)
  try {
    await rm(tagFolderPath, { recursive: true, force: true })
  } catch {
    // Folder might not exist, that's okay
  }
  
  // Remove from tags array
  tags.splice(tagIndex, 1)
  await saveTags(tags)
}

export async function getTagImageCount(id: string): Promise<number> {
  const tagFolderPath = path.join(IMAGES_DIR, id)
  try {
    await access(tagFolderPath)
    const files = await readdir(tagFolderPath)
    // Count only image files
    return files.filter(f => 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
    ).length
  } catch {
    return 0
  }
}
