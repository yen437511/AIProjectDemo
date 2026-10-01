export const WIDTH = 1280;
export const HEIGHT = 720;

export function fitViewport(width, height) {
  const scale = Math.min(width / WIDTH, height / HEIGHT);
  return { width: WIDTH * scale, height: HEIGHT * scale, scale };
}

export function toLogical(clientX, clientY, rect) {
  return {
    x: ((clientX - rect.left) / rect.width) * WIDTH,
    y: ((clientY - rect.top) / rect.height) * HEIGHT,
  };
}

export function resizeCanvas(canvas, width, height, dpr = 1) {
  const size = fitViewport(width, height);
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  canvas.width = Math.round(size.width * dpr);
  canvas.height = Math.round(size.height * dpr);
}
