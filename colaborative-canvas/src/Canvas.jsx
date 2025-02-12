import { useEffect, useRef } from 'react';

function Canvas() {
  const canvasRef = useRef(null);
  const toolbarWidth = 50;

  useEffect(() => {
    let painting = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxt = canvas.getContext('2d');
    let brushSize = 10;
    let brushColor = 'blue';

    function handleResize() {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth - toolbarWidth;
    }

    function startPosition(e) {
      painting = true;

      ctxt.beginPath();
      ctxt.arc(
        e.clientX - toolbarWidth,
        e.clientY,
        ctxt.lineWidth / 2,
        0,
        Math.PI * 2
      );
      ctxt.fill();
      // Start a new path for subsequent drawing
      ctxt.beginPath();
      ctxt.moveTo(e.clientX - toolbarWidth, e.clientY);
    }
    function finishedPosition() {
      painting = false;
      ctxt.beginPath();
    }

    function draw(e) {
      if (!painting) return;
      ctxt.lineWidth = brushSize;
      ctxt.strokeStyle = brushColor;
      ctxt.lineCap = 'round';

      ctxt.lineTo(e.clientX - toolbarWidth, e.clientY);
      ctxt.stroke();
      ctxt.beginPath();
      ctxt.moveTo(e.clientX - toolbarWidth, e.clientY);
    }

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    // Cleanup function: remove event listeners on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', startPosition);
      canvas.removeEventListener('mouseup', finishedPosition);
      canvas.removeEventListener('mousemove', draw);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      width={window.innerWidth - toolbarWidth}
      height={window.innerHeight}
      aria-label="Drawing canvas"
    />
  );
}

export default Canvas;
