# Otomono Jersey Customizer

A mobile-responsive jersey customization application built with HTML, CSS, and JavaScript.

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   ```

2. Deploy via Vercel Dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository: `Rizaski/jerseycustomizer`
   - Vercel will auto-detect the static site
   - Click **Deploy**

3. Or deploy via CLI:
   ```bash
   vercel
   ```

Your site will be live instantly at: `https://your-project.vercel.app`

### GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Choose **master** (or **main**) branch and **/ (root)** folder
5. Click **Save**
6. Your site will be available at: `https://rizaski.github.io/jerseycustomizer`

**Note:** After enabling GitHub Pages, it may take a few minutes for the site to be live.

## Setup Instructions

### Option 1: Using a Local Web Server (Recommended)

To avoid CORS issues, run the application through a local web server:

**Python:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server
```

**PHP:**
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Disable CORS in Browser (For Development Only)

**Chrome:**
```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
```

**Firefox:**
- Install CORS Everywhere extension

## Features

- Customize jersey from 4 sides: Front, Back, Right, Left
- Upload and position logos
- Add player name and jersey number
- Customize colors and patterns
- Adjust brightness, contrast, and opacity
- Real-time preview
- Save your design

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # Styling
├── script.js           # Application logic
├── canvas/             # Jersey images
│   ├── front_jersey.png
│   ├── back_side.png
│   ├── right_side.png
│   └── left_side.png
├── patterns/           # Pattern images
│   ├── 1.jpg
│   ├── 2.jpg
│   └── 3.jpg
└── public/             # Assets
    ├── logo.png
    └── favicon.png
```

