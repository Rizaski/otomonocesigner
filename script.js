// Global State
const state = {
    currentSide: 'front',
    jerseyImages: {
        front: null,
        back: null
    },
    logoImage: null,
    logoSize: 150,
    logoPos: {
        x: 200,
        y: 100
    },
    logoBrightness: 100,
    logoContrast: 100,
    playerName: '',
    playerNumber: '',
    nameSize: 40,
    namePos: {
        x: 200,
        y: 250
    },
    nameColor: '#000000',
    numberSize: 120,
    numberPos: {
        x: 200,
        y: 150
    },
    numberColor: '#000000',
    jerseyBaseColor: '#ffffff',
    selectedPattern: null,
    patternPos: {
        x: 0,
        y: 0
    },
    patternScale: 100,
    patternRotation: 0,
    patternOpacity: 100,
    colorOpacity: 100,
    colorBrightness: 100,
    colorContrast: 100,
    selectedColor: null
};

// Canvas Setup
let canvas;
let ctx;

// Initialize canvas size
function initCanvas() {
    canvas = document.getElementById('jerseyCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not available');
        return;
    }
    if (!canvas.parentElement) {
        console.error('Canvas parent element not found');
        return;
    }
    const container = canvas.parentElement;
    const maxWidth = Math.min(400, container.clientWidth - 40);
    canvas.width = maxWidth;
    canvas.height = maxWidth * 1.2;
    // Don't render here - wait for images to load
}

// Get base path for assets (works with GitHub Pages subdirectory)
function getBasePath() {
    return window.basePath || '';
}

// Load Jersey Images
async function loadJerseyImages(reload = false) {
    const base = getBasePath();
    const imagePaths = {
        front: `${base}/canvas/front_jersey.png`,
        back: `${base}/canvas/back_side.png`
    };

    const loadPromises = [];

    for (const [side, path] of Object.entries(imagePaths)) {
        const loadPromise = new Promise((resolve) => {
            const img = new Image();
            // Add cache-busting parameter if reloading
            const cacheBuster = reload ? `?t=${Date.now()}` : '';

            img.onload = () => {
                state.jerseyImages[side] = img;
                console.log(`Loaded ${side} jersey image`);
                resolve();
            };

            img.onerror = (error) => {
                console.error(`Failed to load ${side} jersey image from ${path}:`, error);
                console.error(`Full path attempted: ${window.location.href.split('/').slice(0, -1).join('/')}/${path}`);
                console.error(`Current URL: ${window.location.href}`);
                // Create a placeholder if image fails to load
                const placeholder = new Image();
                placeholder.onload = () => {
                    state.jerseyImages[side] = placeholder;
                    resolve();
                };
                // Create a data URL for a simple placeholder
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 240;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#e0e0e0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#999';
                ctx.font = '20px Barlow';
                ctx.textAlign = 'center';
                ctx.fillText(`Failed: ${side}`, canvas.width / 2, canvas.height / 2);
                placeholder.src = canvas.toDataURL();
            };

            // Set src after setting up event handlers to ensure handlers are ready
            console.log(`Attempting to load: ${path}${cacheBuster}`);
            img.src = path + cacheBuster;

            // Add timeout to prevent hanging (increase to 5 seconds)
            setTimeout(() => {
                if (!state.jerseyImages[side]) {
                    console.warn(`Timeout loading ${side} jersey image after 5 seconds, using placeholder`);
                    console.warn(`Image path: ${path}, Current URL: ${window.location.href}`);
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 240;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#e0e0e0';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#999';
                    ctx.font = '20px Barlow';
                    ctx.textAlign = 'center';
                    ctx.fillText(`Timeout: ${side}`, canvas.width / 2, canvas.height / 2);
                    const placeholder = new Image();
                    placeholder.onload = () => {
                        state.jerseyImages[side] = placeholder;
                        resolve();
                    };
                    placeholder.src = canvas.toDataURL();
                }
            }, 5000);
        });

        loadPromises.push(loadPromise);
    }

    try {
        await Promise.all(loadPromises);
        console.log('All jersey images loaded successfully');
        renderCanvas();
        return true;
    } catch (error) {
        console.error('Error loading jersey images:', error);
        renderCanvas(); // Still render with what we have
        return true; // Return true to continue initialization
    }
}

// Reload Jersey Images
async function reloadJerseyImages() {
    console.log('Reloading jersey images...');
    // Clear existing images
    state.jerseyImages = {
        front: null,
        back: null
    };
    // Reload with cache-busting
    const success = await loadJerseyImages(true);
    if (success) {
        console.log('Jersey images reloaded successfully');
        // Show notification or feedback
        showNotification('Jersey images reloaded successfully');
    } else {
        console.error('Failed to reload jersey images');
        showNotification('Failed to reload jersey images', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        font-family: 'Barlow', 'Rajdhani', sans-serif;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Pattern image cache
const patternCache = {};

// Render Canvas
function renderCanvas() {
    if (!canvas || !ctx) {
        console.error('Canvas or context not available');
        return;
    }

    // Ensure canvas has dimensions
    if (canvas.width === 0 || canvas.height === 0) {
        initCanvas();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base jersey image
    const currentImage = state.jerseyImages[state.currentSide];
    let drawX = 0;
    let drawY = 0;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (currentImage && currentImage.complete && currentImage.naturalWidth > 0) {
        // Create a temporary canvas for color overlay
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw jersey image - preserve aspect ratio
        const imgAspect = currentImage.width / currentImage.height;
        const canvasAspect = canvas.width / canvas.height;

        if (imgAspect > canvasAspect) {
            // Image is wider - fit to width
            drawHeight = canvas.width / imgAspect;
            drawY = (canvas.height - drawHeight) / 2;
        } else {
            // Image is taller - fit to height
            drawWidth = canvas.height * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
        }

        // Draw jersey image to temp canvas first
        tempCtx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);

        // Apply base color only to jersey pixels (not transparent areas)
        if (state.jerseyBaseColor !== '#ffffff') {
            // Create a mask from the jersey shape (this preserves the alpha channel)
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext('2d');
            maskCtx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);

            // Create color layer that will be clipped to jersey shape
            const colorCanvas = document.createElement('canvas');
            colorCanvas.width = canvas.width;
            colorCanvas.height = canvas.height;
            const colorCtx = colorCanvas.getContext('2d');

            // Fill entire canvas with the base color
            colorCtx.fillStyle = state.jerseyBaseColor;
            colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);

            // Clip color to jersey shape only (destination-in keeps pixels only where destination has content)
            colorCtx.globalCompositeOperation = 'destination-in';
            colorCtx.drawImage(maskCanvas, 0, 0);

            // Replace jersey colors with the new base color while preserving jersey details
            // Use multiply to blend color with jersey (respects alpha channel)
            tempCtx.globalCompositeOperation = 'multiply';
            tempCtx.drawImage(colorCanvas, 0, 0);
            tempCtx.globalCompositeOperation = 'source-over';
        }

        // Apply color filters
        ctx.save();
        ctx.globalAlpha = state.colorOpacity / 100;
        ctx.filter = `brightness(${state.colorBrightness}%) contrast(${state.colorContrast}%)`;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();

        // Apply pattern AFTER jersey and colors are drawn (so it's visible)
        if (state.selectedPattern) {
            const patternImg = patternCache[state.selectedPattern];
            if (!patternImg) {
                // Load pattern if not cached
                const img = new Image();
                // Don't use crossOrigin for local files (file:// protocol)
                img.onerror = () => {
                    console.error('Failed to load pattern:', state.selectedPattern);
                };
                img.onload = () => {
                    patternCache[state.selectedPattern] = img;
                    console.log('Pattern loaded:', state.selectedPattern);
                    renderCanvas();
                };
                img.src = state.selectedPattern;
            } else if (patternImg.complete && patternImg.naturalWidth > 0) {
                console.log('Applying pattern:', state.selectedPattern);

                // Calculate scaled pattern dimensions
                // Scale the pattern to fit the canvas based on patternScale percentage
                const scale = state.patternScale / 100;

                // Calculate scaled dimensions maintaining aspect ratio
                const imgAspect = patternImg.width / patternImg.height;
                const canvasAspect = canvas.width / canvas.height;

                let scaledWidth, scaledHeight;
                if (imgAspect > canvasAspect) {
                    // Pattern is wider - scale to canvas width
                    scaledWidth = canvas.width * scale;
                    scaledHeight = scaledWidth / imgAspect;
                } else {
                    // Pattern is taller - scale to canvas height
                    scaledHeight = canvas.height * scale;
                    scaledWidth = scaledHeight * imgAspect;
                }

                // Create pattern layer canvas
                const patternLayer = document.createElement('canvas');
                patternLayer.width = canvas.width;
                patternLayer.height = canvas.height;
                const patternLayerCtx = patternLayer.getContext('2d');

                // Calculate center position for rotation
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                // Apply rotation transformation
                patternLayerCtx.save();
                patternLayerCtx.translate(centerX, centerY);
                patternLayerCtx.rotate((state.patternRotation * Math.PI) / 180); // Convert degrees to radians
                patternLayerCtx.translate(-centerX, -centerY);

                // Draw pattern image scaled to fit canvas (centered, with position offset)
                const patternX = (canvas.width - scaledWidth) / 2 + state.patternPos.x;
                const patternY = (canvas.height - scaledHeight) / 2 + state.patternPos.y;

                patternLayerCtx.drawImage(patternImg, patternX, patternY, scaledWidth, scaledHeight);
                patternLayerCtx.restore();

                // Create jersey alpha mask
                const jerseyMask = document.createElement('canvas');
                jerseyMask.width = canvas.width;
                jerseyMask.height = canvas.height;
                const maskCtx = jerseyMask.getContext('2d');
                maskCtx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);

                // Apply jersey mask to pattern - keep pattern colors, clip to jersey shape
                patternLayerCtx.save();
                patternLayerCtx.globalCompositeOperation = 'destination-in';
                patternLayerCtx.drawImage(jerseyMask, 0, 0);
                patternLayerCtx.restore();

                // Now blend pattern onto main canvas
                ctx.save();
                ctx.globalAlpha = state.patternOpacity / 100;

                // Use 'hard-light' or 'soft-light' for better pattern visibility
                // These modes work well for texture overlays
                ctx.globalCompositeOperation = 'hard-light';
                ctx.drawImage(patternLayer, 0, 0);

                ctx.restore();

                console.log('Pattern drawn with opacity:', state.patternOpacity, 'scale:', scale);
            } else {
                console.log('Pattern not ready yet, waiting...');
            }
        }
    } else {
        // Draw placeholder if image not loaded
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.font = '20px Barlow';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading jersey...', canvas.width / 2, canvas.height / 2);
    }

    // Draw overlays specific to each side
    renderOverlays();
}

// Render Side-Specific Overlays
function renderOverlays() {
    if (state.currentSide === 'front') {
        // Draw logo if uploaded
        if (state.logoImage) {
            ctx.save();
            ctx.filter = `brightness(${state.logoBrightness}%) contrast(${state.logoContrast}%)`;
            const logoX = state.logoPos.x;
            const logoY = state.logoPos.y;
            ctx.drawImage(state.logoImage, logoX, logoY, state.logoSize, state.logoSize);
            ctx.restore();
        }
    } else if (state.currentSide === 'back') {
        // Draw player name
        if (state.playerName) {
            ctx.save();
            ctx.font = `bold ${state.nameSize}px Barlow`;
            ctx.fillStyle = state.nameColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(state.playerName.toUpperCase(), state.namePos.x, state.namePos.y);
            ctx.restore();
        }

        // Draw player number
        if (state.playerNumber) {
            ctx.save();
            ctx.font = `bold ${state.numberSize}px Barlow`;
            ctx.fillStyle = state.numberColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(state.playerNumber, state.numberPos.x, state.numberPos.y);
            ctx.restore();
        }
    }
}

// Generate Color Palette
function generateColorPalette() {
    // Organized color palette by categories
    const colorCategories = {
        'Primary': [
            '#000000', '#ffffff', '#333333', '#666666', '#999999', '#cccccc'
        ],
        'Reds': [
            '#ff0000', '#cc0000', '#aa0000', '#ff4444', '#cc4400', '#ff8844', '#ff4488'
        ],
        'Greens': [
            '#00ff00', '#00cc00', '#00aa00', '#44ff44', '#88ff00', '#44cc00', '#88ff44'
        ],
        'Blues': [
            '#0000ff', '#0000cc', '#0000aa', '#4444ff', '#0088ff', '#4488ff', '#0044cc'
        ],
        'Yellows': [
            '#ffff00', '#cccc00', '#aaaa00', '#ffff44'
        ],
        'Purples': [
            '#ff00ff', '#8800ff', '#8844ff', '#cc00cc', '#4400cc', '#cc0044'
        ],
        'Cyans': [
            '#00ffff', '#00cccc', '#44ffff', '#0088ff'
        ],
        'Oranges': [
            '#ff8800', '#cc4400', '#ff8844'
        ]
    };

    const colorGrid = document.getElementById('colorGrid');
    colorGrid.innerHTML = '';

    // Create category sections
    Object.entries(colorCategories).forEach(([category, colors]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'color-category';

        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'color-category-title';
        categoryTitle.textContent = category;
        categorySection.appendChild(categoryTitle);

        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'color-category-grid';

        colors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = color;
            colorItem.dataset.color = color;

            // Show hex code on hover
            const tooltip = document.createElement('div');
            tooltip.className = 'color-tooltip';
            tooltip.textContent = color.toUpperCase();
            colorItem.appendChild(tooltip);

            // Check if this color is currently selected
            if (state.jerseyBaseColor === color) {
                colorItem.classList.add('active');
            }

            colorItem.addEventListener('click', () => {
                // Remove active class from all colors
                document.querySelectorAll('.color-item').forEach(item => {
                    item.classList.remove('active');
                });
                colorItem.classList.add('active');

                state.jerseyBaseColor = color;
                state.selectedColor = color;
                document.getElementById('jerseyBaseColor').value = color;
                renderCanvas();
            });

            categoryGrid.appendChild(colorItem);
        });

        categorySection.appendChild(categoryGrid);
        colorGrid.appendChild(categorySection);
    });
}

// Load Pattern Palette
function loadPatternPalette() {
    // Generate pattern paths for all Canvas patterns (1-27)
    const base = getBasePath();
    const patterns = [];
    for (let i = 1; i <= 27; i++) {
        patterns.push(`${base}/patterns/Canvas (${i}).jfif`);
    }

    const patternGrid = document.getElementById('patternGrid');
    patternGrid.innerHTML = '';

    patterns.forEach(patternPath => {
        const patternItem = document.createElement('img');
        patternItem.className = 'pattern-item';
        patternItem.src = patternPath;
        patternItem.alt = patternPath.split('/').pop();
        patternItem.addEventListener('click', () => {
            // Remove active class from all patterns
            document.querySelectorAll('.pattern-item').forEach(item => {
                item.classList.remove('active');
            });
            patternItem.classList.add('active');
            state.selectedPattern = patternPath;
            renderCanvas();
        });
        patternGrid.appendChild(patternItem);
    });
}

// Side Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const side = btn.dataset.side;
        state.currentSide = side;

        // Update active button
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update control panel - keep Color & Pattern section always active
        document.querySelectorAll('.panel-section[data-side]').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelector(`.panel-section[data-side="${side}"]`).classList.add('active');
        document.getElementById('colorPatternSection').classList.add('active');

        renderCanvas();
    });
});

// Color Palette Overlay
document.getElementById('colorPaletteToggle').addEventListener('click', () => {
    const overlay = document.getElementById('colorPaletteOverlay');
    overlay.classList.toggle('active');
    generateColorPalette();
});

document.getElementById('closeColorPalette').addEventListener('click', () => {
    document.getElementById('colorPaletteOverlay').classList.remove('active');
});

// Pattern Palette Overlay
document.getElementById('patternPaletteToggle').addEventListener('click', () => {
    const overlay = document.getElementById('patternPaletteOverlay');
    overlay.classList.toggle('active');
    loadPatternPalette();
});

document.getElementById('closePatternPalette').addEventListener('click', () => {
    document.getElementById('patternPaletteOverlay').classList.remove('active');
});

// Logo Upload
document.getElementById('logoUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                state.logoImage = img;
                document.getElementById('logoControls').style.display = 'block';
                document.getElementById('logoPreview').innerHTML = `<img src="${event.target.result}" alt="Logo Preview">`;
                renderCanvas();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Logo Controls
document.getElementById('logoSize').addEventListener('input', (e) => {
    state.logoSize = parseInt(e.target.value);
    document.getElementById('logoSizeValue').textContent = `${state.logoSize}px`;
    renderCanvas();
});

document.getElementById('logoPosX').addEventListener('input', (e) => {
    state.logoPos.x = parseInt(e.target.value);
    document.getElementById('logoPosXValue').textContent = `${state.logoPos.x}px`;
    renderCanvas();
});

document.getElementById('logoPosY').addEventListener('input', (e) => {
    state.logoPos.y = parseInt(e.target.value);
    document.getElementById('logoPosYValue').textContent = `${state.logoPos.y}px`;
    renderCanvas();
});

document.getElementById('logoBrightness').addEventListener('input', (e) => {
    state.logoBrightness = parseInt(e.target.value);
    document.getElementById('logoBrightnessValue').textContent = `${state.logoBrightness}%`;
    renderCanvas();
});

document.getElementById('logoContrast').addEventListener('input', (e) => {
    state.logoContrast = parseInt(e.target.value);
    document.getElementById('logoContrastValue').textContent = `${state.logoContrast}%`;
    renderCanvas();
});

// Player Name Controls
document.getElementById('playerName').addEventListener('input', (e) => {
    state.playerName = e.target.value;
    renderCanvas();
});

document.getElementById('playerNumber').addEventListener('input', (e) => {
    state.playerNumber = e.target.value;
    renderCanvas();
});

document.getElementById('nameSize').addEventListener('input', (e) => {
    state.nameSize = parseInt(e.target.value);
    document.getElementById('nameSizeValue').textContent = `${state.nameSize}px`;
    renderCanvas();
});

document.getElementById('namePosX').addEventListener('input', (e) => {
    state.namePos.x = parseInt(e.target.value);
    document.getElementById('namePosXValue').textContent = `${state.namePos.x}px`;
    renderCanvas();
});

document.getElementById('namePosY').addEventListener('input', (e) => {
    state.namePos.y = parseInt(e.target.value);
    document.getElementById('namePosYValue').textContent = `${state.namePos.y}px`;
    renderCanvas();
});

document.getElementById('nameColor').addEventListener('input', (e) => {
    state.nameColor = e.target.value;
    renderCanvas();
});

// Player Number Controls
document.getElementById('numberSize').addEventListener('input', (e) => {
    state.numberSize = parseInt(e.target.value);
    document.getElementById('numberSizeValue').textContent = `${state.numberSize}px`;
    renderCanvas();
});

document.getElementById('numberPosX').addEventListener('input', (e) => {
    state.numberPos.x = parseInt(e.target.value);
    document.getElementById('numberPosXValue').textContent = `${state.numberPos.x}px`;
    renderCanvas();
});

document.getElementById('numberPosY').addEventListener('input', (e) => {
    state.numberPos.y = parseInt(e.target.value);
    document.getElementById('numberPosYValue').textContent = `${state.numberPos.y}px`;
    renderCanvas();
});

document.getElementById('numberColor').addEventListener('input', (e) => {
    state.numberColor = e.target.value;
    renderCanvas();
});

// Color & Pattern Controls
document.getElementById('jerseyBaseColor').addEventListener('input', (e) => {
    state.jerseyBaseColor = e.target.value;
    renderCanvas();
});

document.getElementById('patternPosX').addEventListener('input', (e) => {
    state.patternPos.x = parseInt(e.target.value);
    document.getElementById('patternPosXValue').textContent = `${state.patternPos.x}px`;
    renderCanvas();
});

document.getElementById('patternPosY').addEventListener('input', (e) => {
    state.patternPos.y = parseInt(e.target.value);
    document.getElementById('patternPosYValue').textContent = `${state.patternPos.y}px`;
    renderCanvas();
});

document.getElementById('patternScale').addEventListener('input', (e) => {
    state.patternScale = parseInt(e.target.value);
    document.getElementById('patternScaleValue').textContent = `${state.patternScale}%`;
    renderCanvas();
});

document.getElementById('patternRotation').addEventListener('input', (e) => {
    state.patternRotation = parseInt(e.target.value);
    document.getElementById('patternRotationValue').textContent = `${state.patternRotation}°`;
    renderCanvas();
});

document.getElementById('patternOpacity').addEventListener('input', (e) => {
    state.patternOpacity = parseInt(e.target.value);
    document.getElementById('patternOpacityValue').textContent = `${state.patternOpacity}%`;
    renderCanvas();
});

document.getElementById('colorOpacity').addEventListener('input', (e) => {
    state.colorOpacity = parseInt(e.target.value);
    document.getElementById('colorOpacityValue').textContent = `${state.colorOpacity}%`;
    renderCanvas();
});

document.getElementById('colorBrightness').addEventListener('input', (e) => {
    state.colorBrightness = parseInt(e.target.value);
    document.getElementById('colorBrightnessValue').textContent = `${state.colorBrightness}%`;
    renderCanvas();
});

document.getElementById('colorContrast').addEventListener('input', (e) => {
    state.colorContrast = parseInt(e.target.value);
    document.getElementById('colorContrastValue').textContent = `${state.colorContrast}%`;
    renderCanvas();
});

// Reload Jerseys Functionality
document.getElementById('reloadJerseysBtn').addEventListener('click', () => {
    reloadJerseyImages();
});

// Reset Functionality
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all customizations? This cannot be undone.')) {
        resetDesign();
    }
});

function resetDesign() {
    // Reset state to default values
    state.logoImage = null;
    state.logoSize = 150;
    state.logoPos = {
        x: 200,
        y: 100
    };
    state.logoBrightness = 100;
    state.logoContrast = 100;
    state.playerName = '';
    state.playerNumber = '';
    state.nameSize = 40;
    state.namePos = {
        x: 200,
        y: 250
    };
    state.nameColor = '#000000';
    state.numberSize = 120;
    state.numberPos = {
        x: 200,
        y: 150
    };
    state.numberColor = '#000000';
    state.jerseyBaseColor = '#ffffff';
    state.selectedPattern = null;
    state.patternPos = {
        x: 0,
        y: 0
    };
    state.patternScale = 100;
    state.patternRotation = 0;
    state.patternOpacity = 100;
    state.colorOpacity = 100;
    state.colorBrightness = 100;
    state.colorContrast = 100;

    // Reset UI controls
    document.getElementById('logoUpload').value = '';
    document.getElementById('logoPreview').innerHTML = '';
    document.getElementById('logoControls').style.display = 'none';
    document.getElementById('logoSize').value = 150;
    document.getElementById('logoPosX').value = 200;
    document.getElementById('logoPosY').value = 100;
    document.getElementById('logoBrightness').value = 100;
    document.getElementById('logoContrast').value = 100;
    document.getElementById('logoSizeValue').textContent = '150px';
    document.getElementById('logoPosXValue').textContent = '200px';
    document.getElementById('logoPosYValue').textContent = '100px';
    document.getElementById('logoBrightnessValue').textContent = '100%';
    document.getElementById('logoContrastValue').textContent = '100%';

    document.getElementById('playerName').value = '';
    document.getElementById('playerNumber').value = '';
    document.getElementById('nameSize').value = 40;
    document.getElementById('namePosX').value = 200;
    document.getElementById('namePosY').value = 250;
    document.getElementById('nameColor').value = '#000000';
    document.getElementById('nameSizeValue').textContent = '40px';
    document.getElementById('namePosXValue').textContent = '200px';
    document.getElementById('namePosYValue').textContent = '250px';

    document.getElementById('numberSize').value = 120;
    document.getElementById('numberPosX').value = 200;
    document.getElementById('numberPosY').value = 150;
    document.getElementById('numberColor').value = '#000000';
    document.getElementById('numberSizeValue').textContent = '120px';
    document.getElementById('numberPosXValue').textContent = '200px';
    document.getElementById('numberPosYValue').textContent = '150px';

    document.getElementById('jerseyBaseColor').value = '#ffffff';
    document.getElementById('patternPosX').value = 0;
    document.getElementById('patternPosY').value = 0;
    document.getElementById('patternScale').value = 100;
    document.getElementById('patternRotation').value = 0;
    document.getElementById('patternOpacity').value = 100;
    document.getElementById('patternPosXValue').textContent = '0px';
    document.getElementById('patternPosYValue').textContent = '0px';
    document.getElementById('patternScaleValue').textContent = '100%';
    document.getElementById('patternRotationValue').textContent = '0°';
    document.getElementById('patternOpacityValue').textContent = '100%';

    document.getElementById('colorOpacity').value = 100;
    document.getElementById('colorBrightness').value = 100;
    document.getElementById('colorContrast').value = 100;
    document.getElementById('colorOpacityValue').textContent = '100%';
    document.getElementById('colorBrightnessValue').textContent = '100%';
    document.getElementById('colorContrastValue').textContent = '100%';

    // Remove active pattern class
    document.querySelectorAll('.pattern-item').forEach(item => {
        item.classList.remove('active');
    });

    // Re-render canvas
    renderCanvas();
}

// Save Functionality
document.getElementById('saveBtn').addEventListener('click', () => {
    // Create a download link
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `otomono-jersey-${state.currentSide}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});

// Hide loading screen
function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        // Remove from DOM after animation
        setTimeout(() => {
            if (loadingOverlay && loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
        }, 500);
    }
}

// Initialize
window.addEventListener('load', () => {
    // Initialize canvas first
    initCanvas();

    // Set initial active panel sections
    const frontSection = document.querySelector('.panel-section[data-side="front"]');
    const colorPatternSection = document.getElementById('colorPatternSection');
    if (frontSection) frontSection.classList.add('active');
    if (colorPatternSection) colorPatternSection.classList.add('active');

    // Set a maximum timeout for loading (5 seconds)
    const maxLoadTime = setTimeout(() => {
        console.warn('Loading timeout - hiding loading screen anyway');
        hideLoadingScreen();
    }, 5000);

    // Load images and render
    loadJerseyImages().then(() => {
        clearTimeout(maxLoadTime);

        // Generate color palette
        generateColorPalette();

        // Load pattern palette
        loadPatternPalette();

        // Initial render
        renderCanvas();

        console.log('Initialization complete');

        // Hide loading screen after everything is loaded
        hideLoadingScreen();
    }).catch(error => {
        clearTimeout(maxLoadTime);
        console.error('Initialization error:', error);
        // Try to render anyway
        renderCanvas();

        // Hide loading screen even if there's an error
        hideLoadingScreen();
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    initCanvas();
    // Re-render after resize
    if (Object.values(state.jerseyImages).some(img => img !== null)) {
        renderCanvas();
    }
});