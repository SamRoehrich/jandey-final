import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post } from '@/types/post'

const postsDirectory = path.join(process.cwd(), 'content/posts')

/**
 * Get all post slugs from the content/posts directory
 */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx$/, ''))
}

/**
 * Get a single post by its slug
 */
export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    title: data.title || '',
    publishedAt: data.publishedAt || '',
    heroImage: data.heroImage || '',
    author: data.author || '',
    description: data.description || '',
    content,
  }
}

/**
 * Get all posts sorted by publishedAt (newest first)
 */
export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return dateB - dateA // newest first
    })

  return posts
}
