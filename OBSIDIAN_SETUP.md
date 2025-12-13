# Obsidian Setup Guide

This guide will help you set up Obsidian to write and publish blog posts.

## Installation

### 1. Install Obsidian

Download and install Obsidian from: https://obsidian.md/download

### 2. Open the Blog as a Vault

1. Open Obsidian
2. Click "Open folder as vault"
3. Navigate to where the blog repository is cloned on your computer
4. Select the folder and click "Open"

### 3. Install the Git Plugin

1. Go to Settings (gear icon in the bottom left)
2. Click "Community plugins"
3. Click "Browse" and search for "Obsidian Git"
4. Install "Obsidian Git" by Denis Olehov
5. Enable the plugin

### 4. Configure Git Plugin

1. Go to Settings > Community plugins > Obsidian Git
2. Configure these settings:
   - **Auto pull interval**: 5 (minutes)
   - **Auto commit interval**: 0 (we'll commit manually)
   - **Commit message**: `Update: {{date}}`
   - **Pull on startup**: Enabled

## Writing Posts

### Creating a New Post

1. Navigate to `content/posts/` in the file explorer
2. Create a new file with a `.mdx` extension (e.g., `my-new-post.mdx`)
3. Add the frontmatter at the top of the file:

```yaml
---
title: 'My Post Title'
publishedAt: '2024-12-13'
heroImage: '/images/my-image.jpg'
author: 'Jandey'
description: 'A short description of your post'
---
```

4. Write your content below the frontmatter using Markdown

### Adding Images

1. Drag and drop images into the `public/images/` folder
2. Reference them in your post:

```markdown
![Description of image](/images/my-image.jpg)
```

### Frontmatter Fields

| Field         | Required | Description                                       |
| ------------- | -------- | ------------------------------------------------- |
| `title`       | Yes      | The title of your post                            |
| `publishedAt` | Yes      | Publication date (YYYY-MM-DD format)              |
| `heroImage`   | Yes      | Path to the header image (starts with `/images/`) |
| `author`      | Yes      | Your name                                         |
| `description` | Yes      | A short description for previews                  |

## Markdown Features

### Basic Formatting

```markdown
**Bold text**
_Italic text_
~~Strikethrough~~
[Link text](https://example.com)
```

### Headings

```markdown
## Section Heading

### Subsection

#### Smaller heading
```

### Lists

```markdown
- Bullet item
- Another item
  - Nested item

1. Numbered item
2. Second item
```

### Code

Inline code: \`const x = 1\`

Code blocks:
\`\`\`javascript
function hello() {
console.log('Hello!')
}
\`\`\`

### Blockquotes

```markdown
> This is a quote
> It can span multiple lines
```

## Special Components

You can use custom components in your MDX files:

### Callout Boxes

```mdx
<Callout type="tip">This is a helpful tip!</Callout>

<Callout type="warning">Be careful about this.</Callout>

<Callout type="info">Here's some useful information.</Callout>

<Callout type="danger">This is important to know!</Callout>
```

### Image Gallery

```mdx
<ImageGallery images={['/images/photo1.jpg', '/images/photo2.jpg', '/images/photo3.jpg']} />
```

### YouTube Videos

```mdx
<YouTube id="dQw4w9WgXcQ" />
```

## Publishing Your Changes

### Using the Command Palette

1. Press `Ctrl+P` (or `Cmd+P` on Mac) to open the command palette
2. Type "Git" to see available commands
3. Run "Obsidian Git: Commit all changes"
4. Run "Obsidian Git: Push"

### Using the Status Bar

1. Look at the bottom right of Obsidian
2. Click the git icon to see changed files
3. Click the commit button (checkmark icon)
4. Click push (upload icon)

### What Happens Next

1. Your changes are pushed to GitHub
2. The server checks for updates every 5 minutes
3. When it finds changes, it pulls them automatically
4. Your new content is live!

## Editing About and Contact Pages

The About and Contact pages work the same way:

- About page: `content/about.mdx`
- Contact page: `content/contact.mdx`

These pages use simpler frontmatter:

```yaml
---
title: 'About'
description: 'Learn more about me'
---
```

## Tips

1. **Preview your posts**: Use Obsidian's reading view (click the book icon) to preview how your post will look
2. **Use templates**: Create a template file for new posts with the frontmatter already filled in
3. **Organize images**: Create subfolders in `public/images/` for different posts
4. **Check your links**: Make sure image paths start with `/images/`
5. **Date format**: Always use YYYY-MM-DD format for dates

## Troubleshooting

### Changes not appearing on the site

1. Make sure you committed your changes (check for the green checkmark)
2. Make sure you pushed (check the cloud icon shows no pending uploads)
3. Wait 5 minutes for the server to pull changes
4. Check if there were any git conflicts

### Images not showing

1. Verify the image is in `public/images/`
2. Check the path starts with `/images/` (not `public/images/`)
3. Make sure the filename matches exactly (case sensitive)

### Git conflicts

If you see a conflict:

1. Open the command palette (`Ctrl+P`)
2. Run "Obsidian Git: Pull"
3. If there's a conflict, you'll see conflict markers in the file
4. Edit the file to resolve the conflict
5. Commit and push again
