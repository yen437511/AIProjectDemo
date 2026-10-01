export function drawBackground(ctx, time = 0, image = null) {
  if (image) {
    ctx.drawImage(image, 0, 0, 1280, 720);
    return;
  }
  const sky = ctx.createLinearGradient(0, 0, 0, 560);
  sky.addColorStop(0, "#76b8cc");
  sky.addColorStop(1, "#e3edcf");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = "#fff4cf";
  ctx.beginPath();
  ctx.arc(1100, 150, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff60";
  for (let i = 0; i < 4; i++) {
    const x = ((i * 370 + time * 7) % 1480) - 100;
    ctx.beginPath();
    ctx.ellipse(x, 180 + (i % 2) * 50, 90, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [color, base, peak] of [
    ["#88aaa4", 560, 280],
    ["#527f73", 580, 390],
  ]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (let x = 0; x <= 1440; x += 180)
      ctx.lineTo(x, x % 360 === 0 ? base : peak);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.fill();
  }
  ctx.fillStyle = "#203d38";
  ctx.fillRect(0, 560, 1280, 160);
  ctx.strokeStyle = "#45634b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < 1280; x += 23) {
    ctx.moveTo(x, 576);
    ctx.lineTo(x + 5, 562);
  }
  ctx.stroke();
}
