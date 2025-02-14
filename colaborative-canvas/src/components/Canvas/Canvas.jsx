import { useEffect, useRef, useState } from 'react';
import Toolbar from '../Toolbar/Toolbar';

function Canvas() {
  const canvasRef = useRef(null);
  const paintingRef = useRef(false);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000');

  const [strokeHistory, setStrokeHistory] = useState([]);
  // let restoreIndex = -1;
  const toolbarWidth = 200;
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  // Resize canvas dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    loadDrawing();

    function handleResize() {
      setCanvasSize({
        width: window.innerWidth - toolbarWidth,
        height: window.innerHeight,
      });
    }
    handleResize();

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxt = canvas.getContext('2d');
    // ctxt.fillStyle = '#000';
    // Set the color of the canvas

    function startPosition(e) {
      if (e.button !== 0) return; // Only run when left click is pressed
      paintingRef.current = true;
      ctxt.lineWidth = brushSize;
      ctxt.fillStyle = brushColor;
      ctxt.beginPath();
      // setStrokeHistory([strokeHistory.pop()]);
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

    function finishedPosition(e) {
      ctxt.stroke();
      ctxt.closePath();
      paintingRef.current = false;

      e.preventDefault();
    }

    function draw(e) {
      if (!paintingRef.current) return;
      ctxt.lineWidth = brushSize;
      ctxt.strokeStyle = brushColor;
      ctxt.lineCap = 'round';

      ctxt.lineTo(e.clientX - toolbarWidth, e.clientY);
      ctxt.stroke();
      ctxt.beginPath();
      ctxt.moveTo(e.clientX - toolbarWidth, e.clientY);
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    // Cleanup function: remove event listeners on unmount
    return () => {
      canvas.removeEventListener('mousedown', startPosition);
      canvas.removeEventListener('mouseup', finishedPosition);
      canvas.removeEventListener('mousemove', draw);
    };
  }, [brushSize, brushColor, canvasSize]);

  // Update brush width dynamically without triggering re-renders
  function changeBrushSize(size) {
    setBrushSize(size);
  }

  function changeBrushColor(color) {
    setBrushColor(color);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxt = canvas.getContext('2d');
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Save the current canvas state to history using getImageData
  function saveToHistory() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxt = canvas.getContext('2d');
    // Capture the entire canvas
    const imageData = ctxt.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, imageData]);
  }

  // Undo: restore previous state from history using putImageData
  function undo() {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    const ctxt = canvas.getContext('2d');
    // Remove the last stroke
    setStrokeHistory((prev) => {
      const newHistory = [...prev];
      newHistory.pop();
      // Clear the canvas and restore the previous state if it exists
      ctxt.fillStyle = '#fff';
      ctxt.fillRect(0, 0, canvas.width, canvas.height);
      if (newHistory.length > 0) {
        ctxt.putImageData(newHistory[newHistory.length - 1], 0, 0);
      }
      return newHistory;
    });
  }

  function saveDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    localStorage.setItem('savedDrawing', dataURL);
  }

  function loadDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxt = canvas.getContext('2d');
    const savedDrawing = localStorage.getItem('savedDrawing');
    if (savedDrawing) {
      const img = new Image();
      img.src = savedDrawing;
      img.onload = () => ctxt.drawImage(img, 0, 0);
    }
  }

  function exportAsImage() {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
  }

  return (
    <>
      <Toolbar
        onSave={saveDrawing}
        onLoad={loadDrawing}
        brushSize={brushSize}
        brushColor={brushColor}
        onBrushSizeChange={changeBrushSize}
        onBrushColorChange={changeBrushColor}
        onClearCanvas={clearCanvas}
        onUndo={undo} // Add Undo button
        onExport={exportAsImage} // Download data for current drawing
      />
      <canvas
        ref={canvasRef}
        id="canvas"
        width={canvasSize.width}
        height={canvasSize.height}
        aria-label="Drawing canvas" // Save to history on mouseup (final stroke)
        onMouseUp={saveToHistory}
      />
    </>
  );
}

export default Canvas;
