import { useCallback, useEffect, useRef, useState } from 'react';
import Toolbar from '../Toolbar/Toolbar';

function Canvas() {
  const canvasRef = useRef(null);
  const paintingRef = useRef(false);

  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000');

  const [strokeHistory, setStrokeHistory] = useState([]);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  // Refs for brush properties so the dom dosent update unecesaraly
  const brushSizeRef = useRef(brushSize);
  const brushColorRef = useRef(brushColor);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    brushColorRef.current = brushColor;
  }, [brushColor]);

  // Resize canvas dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ width, height });
    });

    // Preserve drawing on resize
    const ctxt = canvas.getContext('2d');
    const currentImage = strokeHistory[strokeHistory.length - 1];
    if (currentImage) {
      ctxt.putImageData(currentImage, 0, 0);
    }

    observer.observe(canvas);
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Clean up
    return () => {
      // window.removeEventListener('resize', handleResize);
      observer.disconnect();
      canvas.removeEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
    };
  }, [strokeHistory]);

  // Painting logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxt = canvas.getContext('2d');
    function getCanvasPosition(e) {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }

    function startPosition(e) {
      if (e.button !== 0) return; // Only run when left click is pressed
      paintingRef.current = true;

      // Cordinates of the mouse in the element
      const [x, y] = getCanvasPosition(e);

      // ctxt.lineWidth = brushSizeRef.current;
      ctxt.fillStyle = brushColorRef.current;
      ctxt.beginPath();
      ctxt.arc(x, y, brushSizeRef.current / 2, 0, Math.PI * 2);
      ctxt.fill();

      ctxt.beginPath();
      ctxt.moveTo(x, y);
    }

    function finishedPosition(e) {
      ctxt.stroke();
      ctxt.closePath();
      paintingRef.current = false;

      e.preventDefault();
    }

    function draw(e) {
      if (!paintingRef.current) return;
      const [x, y] = getCanvasPosition(e);

      ctxt.lineWidth = brushSizeRef.current;
      ctxt.strokeStyle = brushColorRef.current;
      ctxt.lineCap = 'round';

      ctxt.lineTo(x, y);
      ctxt.stroke();
      ctxt.beginPath();
      ctxt.moveTo(x, y);
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
  }, [canvasSize]);

  // Update brush width dynamically without triggering re-renders
  function changeBrushSize(size) {
    setBrushSize(size);
  }

  function changeBrushColor(color) {
    setBrushColor(color);
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxt = canvas.getContext('2d');
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    const imageData = ctxt.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, imageData]);
  }, []);

  // Save the current canvas state to history using getImageData
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxt = canvas.getContext('2d');
    // Capture the entire canvas
    const imageData = ctxt.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, imageData]);
  }, []);

  // Undo: restore previous state from history using putImageData
  const undo = useCallback(() => {
    setStrokeHistory((prev) => {
      if (prev.length === 0) return prev;

      const newHistory = prev.slice(0, -1);
      const canvas = canvasRef.current;
      if (!canvas) return newHistory;

      const ctxt = canvas.getContext('2d');
      ctxt.clearRect(0, 0, canvas.width, canvas.height);

      if (newHistory.length > 0) {
        ctxt.putImageData(newHistory[newHistory.length - 1], 0, 0);
      }

      return newHistory;
    });
  }, []);

  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    localStorage.setItem('savedDrawing', dataURL);
  }, []);

  const loadDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // const imageData = ctxt.getImageData(0, 0, canvas.width, canvas.height);
    const ctxt = canvas.getContext('2d');
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    const savedDrawing = localStorage.getItem('savedDrawing');
    if (savedDrawing) {
      const img = new Image();
      img.src = savedDrawing;
      img.onload = () => ctxt.drawImage(img, 0, 0);
    }
    saveToHistory();
  }, [saveToHistory]);

  const exportAsImage = useCallback(() => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
  }, []);
  // // Resumes the users last saved drawing on launch
  // useEffect(() => {
  //   loadDrawing();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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
