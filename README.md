# Jandey Shaclekford's Blog

A simple, fast blog built with [Bun](https://bun.sh) and MDX. No build step, no CMS - just markdown files and instant updates.

## Features

- **Fast**: Bun serves pages instantly, MDX is compiled with caching
- **Simple**: No build step, changes to content are live immediately
- **MDX Support**: Write posts in Markdown with embedded React components
- **Dark Mode**: Automatic dark mode based on system preferences
- **Tailscale**: Hosted privately on your tailnet with HTTPS

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.3 or later

### Development

```bash
# Install dependencies
bun install

# Start the development server (with hot reload)
bun dev

# Or run in production mode
bun start
```

Open http://localhost:3000 to view the site.

## Project Structure

```
├── content/
│   ├── posts/          # Blog posts (MDX files)
│   │   └── *.mdx
│   ├── about.mdx       # About page
│   └── contact.mdx     # Contact page
├── public/
│   ├── images/         # Images for posts
│   └── styles.css      # All CSS styles
├── src/
│   ├── server.ts       # Bun.serve entry point
│   ├── router.ts       # Route handling
│   ├── content.ts      # File system content loading
│   ├── mdx.ts          # MDX compilation with caching
│   ├── render.ts       # JSX to HTML rendering
│   ├── components/     # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Card.tsx
│   │   └── mdx/        # MDX components (Callout, CodeBlock, etc.)
│   └── templates/      # Page templates
│       ├── layout.tsx
│       ├── home.tsx
│       ├── post.tsx
│       ├── posts.tsx
│       ├── page.tsx
│       └── not-found.tsx
├── Dockerfile
├── docker-compose.yml
└── ts-serve.json       # Tailscale Serve config
```

## Writing Posts

Create a new `.mdx` file in `content/posts/`:

```mdx
---
title: 'My Post Title'
publishedAt: '2024-12-13'
heroImage: '/images/my-image.jpg'
author: 'Jandey'
description: 'A short description'
---

Your content here...
```

### Available Components

```mdx
<Callout type="tip">A helpful tip!</Callout>
<Callout type="warning">Be careful!</Callout>
<Callout type="info">Good to know.</Callout>
<Callout type="danger">Important warning!</Callout>

<ImageGallery images={['/images/a.jpg', '/images/b.jpg']} />

<YouTube id="dQw4w9WgXcQ" />
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

### Quick Deploy with Docker

```bash
# Create environment file
cp .env.example .env
# Edit .env and add your Tailscale auth key

# Start the containers
docker compose up -d
```

The site will be available at `https://jandey-blog.<your-tailnet>.ts.net`

## Content Workflow

This blog is designed to work with [Obsidian](https://obsidian.md) and the Obsidian Git plugin:

1. Open the repo as an Obsidian vault
2. Write/edit posts in `content/posts/`
3. Add images to `public/images/`
4. Commit and push via the Git plugin
5. Server auto-pulls every 5 minutes

See [OBSIDIAN_SETUP.md](./OBSIDIAN_SETUP.md) for detailed setup instructions.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) 1.3
- **Content**: [MDX](https://mdxjs.com) with [gray-matter](https://github.com/jonschlinkert/gray-matter)
- **Syntax Highlighting**: [Shiki](https://shiki.style)
- **Styling**: Plain CSS with CSS variables
- **Hosting**: Docker + [Tailscale](https://tailscale.com)

## License

MIT
