import { readdir } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from './mdx'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')
const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface PostFrontmatter {
  title: string
  publishedAt: string
  heroImage: string
  author: string
  description: string
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string // rendered HTML
}

export interface PageFrontmatter {
  title: string
  description?: string
}

export interface Page {
  slug: string
  frontmatter: PageFrontmatter
  content: string // rendered HTML
}

/**
 * Get all post slugs from the content/posts directory
 */
export async function getPostSlugs(): Promise<string[]> {
  try {
    const files = await readdir(POSTS_DIR)
    return files.filter((file) => file.endsWith('.mdx')).map((file) => file.replace(/\.mdx$/, ''))
  } catch {
    return []
  }
}

/**
 * Get a single post by slug
 */
export async function getPost(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  const file = Bun.file(filePath)

  if (!(await file.exists())) {
    return null
  }

  const source = await file.text()
  const { data, content: mdxContent } = matter(source)
  const renderedContent = await compileMDX(mdxContent, filePath)

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content: renderedContent,
  }
}

/**
 * Get all posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<Post[]> {
  const slugs = await getPostSlugs()
  const posts = await Promise.all(slugs.map((slug) => getPost(slug)))

  return posts
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.frontmatter.publishedAt).getTime()
      const dateB = new Date(b.frontmatter.publishedAt).getTime()
      return dateB - dateA
    })
}

/**
 * Get a page (about, contact) by slug
 */
export async function getPage(slug: string): Promise<Page | null> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  const file = Bun.file(filePath)

  if (!(await file.exists())) {
    return null
  }

  const source = await file.text()
  const { data, content: mdxContent } = matter(source)
  const renderedContent = await compileMDX(mdxContent, filePath)

  return {
    slug,
    frontmatter: data as PageFrontmatter,
    content: renderedContent,
  }
}
