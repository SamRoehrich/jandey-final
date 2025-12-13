# Deployment Guide

This guide explains how to deploy the Jandey Shaclekford blog to a server using Docker and Tailscale.

## Prerequisites

- A server with Docker and Docker Compose installed
- A Tailscale account
- The server connected to your Tailnet

## Server Setup

### 1. Install Docker

```bash
# On Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Install Tailscale on the host

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

### 3. Configure Tailscale ACLs

In your Tailscale admin console (https://login.tailscale.com/admin/acls), add a tag for containers:

```json
{
  "tagOwners": {
    "tag:container": ["autogroup:admin"]
  }
}
```

### 4. Create Tailscale Auth Key or OAuth Client

**Option A: OAuth Client (Recommended)**

1. Go to https://login.tailscale.com/admin/settings/oauth
2. Click "Generate OAuth client"
3. Select "Auth Keys: Write" scope
4. Select the `tag:container` tag
5. Generate and save the client secret

**Option B: Auth Key**

1. Go to https://login.tailscale.com/admin/settings/keys
2. Generate a new auth key
3. Enable "Reusable" and set expiration
4. Select the `tag:container` tag

## Deploy the Application

### 1. Clone the repository

```bash
git clone <your-repo-url> /opt/jandey-blog
cd /opt/jandey-blog
```

### 2. Create environment file

```bash
cp .env.example .env
```

Edit `.env` and add your Tailscale auth key:

```bash
# For OAuth client (recommended)
TS_AUTHKEY=tskey-client-xxxxx?ephemeral=false

# OR for auth key
TS_AUTHKEY=tskey-auth-xxxxx
```

### 3. Start the containers

```bash
docker compose up -d
```

### 4. Verify deployment

Check that all containers are running:

```bash
docker compose ps
```

You should see:

- `tailscale` - The Tailscale sidecar
- `web` - The Bun web server
- `poller` - The git polling service

### 5. Access the site

The site will be available at:

```
https://jandey-blog.<your-tailnet>.ts.net
```

## Updating Content

Content updates happen automatically:

1. Your girlfriend edits/creates MDX files in Obsidian
2. Obsidian Git plugin commits and pushes to GitHub
3. The poller container checks for updates every 5 minutes
4. When updates are found, it pulls the changes
5. Content is served immediately (no rebuild needed)

## Manual Operations

### View logs

```bash
docker compose logs -f web
docker compose logs -f poller
docker compose logs -f tailscale
```

### Force pull latest content

```bash
docker compose exec poller git pull
```

### Rebuild the web container

```bash
docker compose build web
docker compose up -d web
```

### Restart all services

```bash
docker compose restart
```

### Stop all services

```bash
docker compose down
```

## Troubleshooting

### Container won't start

Check the logs:

```bash
docker compose logs tailscale
```

Common issues:

- Invalid `TS_AUTHKEY` - regenerate the key
- Missing `/dev/net/tun` - ensure the host has TUN support
- ACL issues - verify the tag exists in Tailscale ACLs

### Site not accessible

1. Check if Tailscale container joined the network:

   ```bash
   docker compose exec tailscale tailscale status
   ```

2. Verify Tailscale Serve is running:

   ```bash
   docker compose exec tailscale tailscale serve status
   ```

3. Check if web server is responding:
   ```bash
   docker compose exec tailscale curl http://127.0.0.1:3000
   ```

### Git poller not working

Check the poller logs:

```bash
docker compose logs poller
```

Ensure the repo has the correct remote configured and the server has access.
