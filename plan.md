# Migration Plan: Payload CMS to React + Markdown

## Overview

Remove Payload CMS and replace with:

- **MDX** for blog posts
- **React components** for pages (content as code)
- **Static navigation** (no database)
- **Local images** (no Vercel Blob)

Based on: https://leerob.com/agents

---

## Site Structure

```
/                   → Home page (React component)
/about              → About page (React component)
/contact            → Contact page (React component)
/posts              → All blog posts listing
/posts/[slug]       → Individual post (MDX)
```

## Navigation

```typescript
export const headerNav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]
```

---

## Execution Checklist

### Phase 1: Setup MDX Infrastructure

- [ ] Install dependencies: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `gray-matter`
- [ ] Update `next.config.js` for MDX support
- [ ] Create `content/posts/` directory
- [ ] Create `src/data/navigation.ts` with header/footer nav
- [ ] Create `src/utilities/content.ts` (getAllPosts, getPostBySlug, getPostSlugs)

### Phase 2: Download Assets

- [ ] Download images from Payload GitHub repo to `public/images/`:
  - `image-post1.webp`
  - `image-post2.webp`
  - `image-post3.webp`
  - `image-hero1.webp`

### Phase 3: Create MDX Posts

- [ ] Create `content/posts/digital-horizons.mdx`
- [ ] Create `content/posts/global-gaze.mdx`
- [ ] Create `content/posts/dollar-and-sense.mdx`

### Phase 4: Create/Rewrite Pages

- [ ] Rewrite `src/app/(frontend)/page.tsx` (Home - React component)
- [ ] Create `src/app/(frontend)/about/page.tsx` (React component)
- [ ] Create `src/app/(frontend)/contact/page.tsx` (React component)
- [ ] Rewrite `src/app/(frontend)/posts/page.tsx` (list all posts)
- [ ] Rewrite `src/app/(frontend)/posts/[slug]/page.tsx` (single post from MDX)
- [ ] Delete `src/app/(frontend)/[slug]/` directory
- [ ] Delete `src/app/(frontend)/posts/page/` directory
- [ ] Delete/simplify sitemap routes

### Phase 5: Rewrite Components

- [ ] Rewrite `src/Header/Component.tsx` (static nav, remove CMS fetch)
- [ ] Rewrite `src/Footer/Component.tsx` (static nav, remove CMS fetch)
- [ ] Simplify `src/heros/PostHero/index.tsx` (use string image path)
- [ ] Simplify `src/components/Media/` (local images only)
- [ ] Simplify `src/components/Card/index.tsx` (new Post type)
- [ ] Remove `src/blocks/RelatedPosts/`

### Phase 6: Delete Payload Code

- [ ] Delete `src/payload.config.ts`
- [ ] Delete `src/payload-types.ts`
- [ ] Delete `src/collections/` directory
- [ ] Delete `src/access/` directory
- [ ] Delete `src/plugins/` directory
- [ ] Delete `src/endpoints/` directory
- [ ] Delete `src/migrations/` directory
- [ ] Delete `src/fields/` directory
- [ ] Delete `src/search/` directory
- [ ] Delete `src/hooks/populatePublishedAt.ts`
- [ ] Delete `src/hooks/revalidateRedirects.ts`
- [ ] Delete `src/app/(payload)/` directory
- [ ] Delete `src/components/AdminBar/`
- [ ] Delete `src/components/BeforeDashboard/`
- [ ] Delete `src/components/BeforeLogin/`
- [ ] Delete `src/components/LivePreviewListener/`
- [ ] Delete `src/components/PayloadRedirects/`
- [ ] Delete `src/components/CustomUpload/`
- [ ] Delete `src/blocks/Form/` directory
- [ ] Delete `src/blocks/ArchiveBlock/config.ts`
- [ ] Delete `src/blocks/Banner/config.ts`
- [ ] Delete `src/blocks/CallToAction/config.ts`
- [ ] Delete `src/blocks/Carousel/config.ts`
- [ ] Delete `src/blocks/Code/config.ts`
- [ ] Delete `src/blocks/Content/config.ts`
- [ ] Delete `src/blocks/MediaBlock/config.ts`
- [ ] Delete `src/heros/config.ts`
- [ ] Delete `src/Header/config.ts`
- [ ] Delete `src/Header/hooks/`
- [ ] Delete `src/Header/RowLabel.tsx`
- [ ] Delete `src/Footer/config.ts`
- [ ] Delete `src/Footer/hooks/`
- [ ] Delete `src/Footer/RowLabel.tsx`
- [ ] Delete `src/utilities/getGlobals.ts`
- [ ] Delete `src/utilities/getDocument.ts`
- [ ] Delete `src/utilities/getMeUser.ts`
- [ ] Delete `src/utilities/getRedirects.ts`
- [ ] Delete `src/blocks/RenderBlocks.tsx`
- [ ] Delete `src/heros/RenderHero.tsx`

### Phase 7: Delete Tests

- [ ] Delete `tests/` directory entirely
- [ ] Delete `playwright.config.ts`
- [ ] Delete `vitest.config.mts`
- [ ] Delete `vitest.setup.ts`
- [ ] Delete `test.env`

### Phase 8: Remove Dependencies

- [ ] Remove from `package.json`:
  - `@payloadcms/admin-bar`
  - `@payloadcms/db-postgres`
  - `@payloadcms/live-preview-react`
  - `@payloadcms/next`
  - `@payloadcms/plugin-form-builder`
  - `@payloadcms/plugin-nested-docs`
  - `@payloadcms/plugin-redirects`
  - `@payloadcms/plugin-search`
  - `@payloadcms/plugin-seo`
  - `@payloadcms/richtext-lexical`
  - `@payloadcms/storage-vercel-blob`
  - `@payloadcms/ui`
  - `@vercel/blob`
  - `graphql`
  - `@playwright/test`
  - `playwright`
  - `playwright-core`
  - `vitest`
  - `@vitejs/plugin-react`
  - `jsdom`
  - `@testing-library/react`
  - `vite-tsconfig-paths`
- [ ] Remove scripts from `package.json`:
  - `generate:importmap`
  - `generate:types`
  - `payload`
  - `test`
  - `test:e2e`
  - `test:int`
- [ ] Run `pnpm install`

### Phase 9: Cleanup Configs

- [ ] Update `next.config.js` (remove Payload transpile, add MDX)
- [ ] Update `tsconfig.json` (remove `@payload-config` path)
- [ ] Delete `docker-compose.yml`
- [ ] Delete `Dockerfile`
- [ ] Update `.env.example` (remove DB/Payload vars)

### Phase 10: Build & Fix

- [ ] Run `pnpm build`
- [ ] Fix any remaining TypeScript/import errors
- [ ] Test locally with `pnpm dev`

---

## New Types

```typescript
// src/types/post.ts
export interface Post {
  slug: string
  title: string
  publishedAt: string
  heroImage: string
  author: string
  description: string
  content: string // raw MDX content
}
```

---

## File Counts

- **Files to delete**: ~80+
- **Files to create**: ~10
- **Files to modify**: ~15
- **Dependencies to remove**: ~20
- **Dependencies to add**: 4

---

## Key Decisions

1. **Content as code**: All pages are React components (not MDX)
2. **Simplified Media**: Images use string paths, no Vercel Blob
3. **No related posts**: Feature removed
4. **No forms**: Contact page is static info only
5. **No search**: Feature removed
6. **No tests**: All tests deleted (can add back later)
7. **No categories**: Posts are uncategorized, all shown on /posts
