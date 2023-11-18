export const drawRect = (detections, ctx) => {
  detections.forEach(prediction => {
    const [x, y, width, height] = prediction['bbox'];
    const text = prediction['class'];

    // Define the style for the rectangle
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#00FFFF';

    // Define the radius for rounded corners
    const cornerRadius = 6;

    // Begin drawing
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + width - cornerRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
    ctx.lineTo(x + width, y + height - cornerRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
    ctx.lineTo(x + cornerRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
    ctx.stroke();

    // Draw the label
    ctx.fillText(text, x, y - 10);
  });
};

