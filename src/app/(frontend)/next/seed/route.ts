// Seed route has been disabled - content is now managed via MDX files
// If you need to seed content, add MDX files to the content/posts directory

export async function POST(): Promise<Response> {
  return new Response('Seeding is disabled. Content is managed via MDX files.', { status: 410 })
}
