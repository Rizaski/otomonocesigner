# Otomono Jersey Customizer

A mobile-responsive jersey customization application built with HTML, CSS, and JavaScript.

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

