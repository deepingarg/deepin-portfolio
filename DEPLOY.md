# Deploying Deepin Garg Portfolio to Vercel

## What's in the `dist/` folder

| File | Purpose |
|---|---|
| `index.html` | Obfuscated, minified portfolio (deploy this) |
| `vercel.json` | Security headers config |

The JS inside `index.html` is fully obfuscated with:
- Control-flow flattening · Dead-code injection · Debug protection
- Base64 string array encoding · Self-defending code
- Anti-DevTools: right-click disabled, F12/Ctrl+Shift+I blocked, DevTools size detection

---

## Option A — Vercel CLI (fastest)

1. **Install Vercel CLI** (if not already):
   ```
   npm install -g vercel
   ```

2. **Deploy the dist folder:**
   ```
   cd "C:\Users\BizTecno\Documents\Claude\Projects\update deepin portfolio\dist"
   vercel
   ```

3. **Follow the prompts:**
   - Link to your Vercel account
   - Set project name (e.g. `deepin-portfolio`)
   - **Root directory:** press Enter (current folder `dist/`)
   - Framework: **Other**

4. **Production deploy:**
   ```
   vercel --prod
   ```

---

## Option B — Vercel Dashboard (drag & drop)

1. Go to **https://vercel.com** → Log in (or sign up free)
2. Click **"Add New Project"**
3. Choose **"Deploy without a Git repository"** → drag & drop the entire `dist/` folder
4. Set project name, click **Deploy**
5. Your live URL will be: `https://your-project-name.vercel.app`

---

## Option C — GitHub + Vercel (auto-deploy on every push)

1. Create a new GitHub repo (e.g. `deepin-portfolio`)
2. Push only the `dist/` contents to the repo root:
   ```
   cd dist
   git init
   git add .
   git commit -m "Initial portfolio deploy"
   git remote add origin https://github.com/YOUR_USERNAME/deepin-portfolio.git
   git push -u origin main
   ```
3. In Vercel Dashboard → **Import Git Repository** → select your repo
4. Root directory: `/` (repo root = dist contents)
5. Click **Deploy** — Vercel will auto-redeploy on every git push

---

## Custom Domain (optional)

1. In Vercel Dashboard → your project → **Settings → Domains**
2. Add your domain (e.g. `deepingarg.com`)
3. Update your domain's DNS with the CNAME/A records Vercel provides

---

## Adding the Hero Video

To activate the video background, place your `hero.mp4` file in the same `dist/` folder before deploying (or re-deploy after adding it).

- **Recommended specs:** 1920×1080, H.264, ~5–15 MB, 10–20 sec loop, muted
- The video fades in automatically once loaded (opacity 0→0.2 for a dark cinematic look)

---

## After Deploying

Update these two lines in `index.html` (before building next time) to match your live URL:

```html
<link rel="canonical" href="https://YOUR-LIVE-URL.vercel.app/" />
```

And in the JSON-LD block:
```json
"url": "https://YOUR-LIVE-URL.vercel.app/"
```

Then run `node build.js` again and re-deploy `dist/`.
