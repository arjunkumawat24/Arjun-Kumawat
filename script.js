const canvas = document.getElementById('frame-canvas');
const context = canvas.getContext('2d');

const frameCount = 240;
const currentFrame = index => (
  `./video_frames_24fps_high_quality/frame_${index.toString().padStart(6, '0')}.jpg`
);

const images = [];
let targetFrame = 0;
let currentFrameIndex = 0; // Float for smooth interpolation

let initialized = false;
function init() {
    if (initialized) return;
    initialized = true;
    resize();
    render();
    loop();
}

// Preload images
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  images.push(img);
}

// Set up load listener BEFORE setting source
images[0].onload = init;

// Now set sources to begin loading
for (let i = 0; i < frameCount; i++) {
  images[i].src = currentFrame(i);
}

// Fallback in case image 0 loads instantly from cache before event triggers
if (images[0].complete) {
    init();
}

// Handle window resizing
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
}
window.addEventListener('resize', resize);

// Draw the current frame on the canvas
function render() {
  const frameToDraw = Math.round(currentFrameIndex);
  const img = images[frameToDraw];
  
  if (!img || !img.complete) return;

  // Calculate object-fit: cover equivalent for canvas
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  
  const centerShift_x = (canvas.width - img.width * ratio) / 2;
  const centerShift_y = (canvas.height - img.height * ratio) / 2;  
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    img, 
    0, 0, img.width, img.height,
    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
  );
}

// Update the target frame based on scroll position
window.addEventListener('scroll', () => {
  const html = document.documentElement;
  
  // Calculate how far down the user has scrolled (0 to 1)
  const scrollFraction = html.scrollTop / (html.scrollHeight - html.clientHeight);
  
  // Map the scroll fraction to the frame count
  targetFrame = Math.min(
    frameCount - 1,
    scrollFraction * frameCount
  );
});

// Animation loop to smoothly interpolate (lerp) towards the target frame
function loop() {
  // Simple easing/lerping function (0.1 controls the smoothness/speed)
  currentFrameIndex += (targetFrame - currentFrameIndex) * 0.1;
  
  // Only render if there's a visible change to save performance
  if (Math.abs(targetFrame - currentFrameIndex) > 0.01) {
    render();
  }
  
  requestAnimationFrame(loop);
}
