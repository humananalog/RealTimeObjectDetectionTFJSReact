export const drawRect = (detections, ctx, imgWidth, imgHeight) => {
  // Loop through each prediction
  detections.forEach(prediction => {
    // Extract boxes and classes
    const [x, y, width, height] = prediction['bbox']; 
    const text = prediction['class']; 

    // Set styling based on width and height comparison
    const isWidthBig = width > 0.5 * imgWidth;
    const isHeightBig = height > 0.5 * imgHeight;
    ctx.strokeStyle = isWidthBig || isHeightBig ? 'green' : 'red';

    ctx.lineWidth = 5; // Set line width for the rectangles
    ctx.font = '18px Arial';

    // Draw rectangles and text
    ctx.beginPath();   
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText(text, x, y - 10); // Adjust text position above the rectangle
    ctx.rect(x, y, width, height); 
    ctx.stroke();
  });
}
