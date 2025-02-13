import { useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar';

function Canvas() {
  const canvasRef = useRef(null);
  const paintingRef = useRef(false);
  const [brushWidth, setBrushWidth] = useState(10);
  const brushColorRef = useRef('green');
  const toolbarWidth = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxt = canvas.getContext('2d');
    const brushColor = brushColorRef.current;

    function handleResize() {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth - toolbarWidth;
    }

    function startPosition(e) {
      paintingRef.current = true;
      ctxt.lineWidth = brushWidth;
      ctxt.fillStyle = brushColor;
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
      paintingRef.current = false;
      ctxt.beginPath();
    }

    function draw(e) {
      if (!paintingRef.current) return;
      ctxt.lineWidth = brushWidth;
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
  }, [brushWidth]);

  // Update brush width dynamically without triggering re-renders
  function changeBrushSize(size) {
    setBrushWidth(size);
  }

  return (
    <>
      <Toolbar brushWidth={brushWidth} onBrushSizeChange={changeBrushSize} />
      <canvas
        ref={canvasRef}
        id="canvas"
        width={window.innerWidth - toolbarWidth}
        height={window.innerHeight}
        aria-label="Drawing canvas"
      />
    </>
  );
}

export default Canvas;
