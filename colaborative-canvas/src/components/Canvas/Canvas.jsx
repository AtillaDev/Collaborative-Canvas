import { useCallback, useEffect, useRef, useState } from 'react';
import Toolbar from '../Toolbar/Toolbar';

function Canvas() {
  const canvasRef = useRef(null);
  const paintingRef = useRef(false);

  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000');

  // eslint-disable-next-line no-unused-vars
  const [strokeHistory, setStrokeHistory] = useState([]);
  const [canvasSize, setCanvasSize] = useState({
    width: 1300,
    height: 1000,
  });

  // Refs for brush properties so the dom dosent update unecesaraly
  const brushSizeRef = useRef(brushSize);
  const brushColorRef = useRef(brushColor);

  const [transform, setTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });

  // Add wheel handler for zooming
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    console.log('scroll');
    const scaleChange = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => ({
      ...prev,
      scale: prev.scale * scaleChange,
    }));
  }, []);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    brushColorRef.current = brushColor;
  }, [brushColor]);

  // Resize canvas dynamically
  // useEffect(() => {
  //   // const workSpace = workSpace.ref;
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;

  //   const observer = new ResizeObserver((entries) => {
  //     const { width, height } = entries[0].contentRect;

  //     // Update canvas dimensions (resets the canvas)
  //     setCanvasSize({ width, height });
  //   });

  //   const handleContext = (event) => {
  //     event.preventDefault();
  //   };

  //   observer.observe(canvas);
  //   canvas.addEventListener('contextmenu', handleContext);

  //   return () => {
  //     observer.disconnect();
  //     canvas.removeEventListener('contextmenu', handleContext);
  //   };
  // }, []);

  // Painting logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxt = canvas.getContext('2d');

    function getCanvasPosition(e) {
      const rect = canvas.getBoundingClientRect();
      return [
        (e.clientX - rect.left - transform.x) / transform.scale,
        (e.clientY - rect.top - transform.y) / transform.scale,
      ];
    }

    function applyTransform() {
      ctxt.setTransform(
        transform.scale,
        0,
        0,
        transform.scale,
        transform.x,
        transform.y
      );
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
      applyTransform();
      const [x, y] = getCanvasPosition(e);

      ctxt.lineWidth = brushSizeRef.current;
      ctxt.strokeStyle = brushColorRef.current;
      ctxt.lineJoin = 'round';
      ctxt.lineCap = 'round';

      ctxt.lineTo(x, y);
      ctxt.stroke();
      ctxt.beginPath();
      ctxt.moveTo(x, y);
    }

    // canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    // Cleanup function: remove event listeners on unmount
    return () => {
      // canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', startPosition);
      canvas.removeEventListener('mouseup', finishedPosition);
      canvas.removeEventListener('mousemove', draw);
    };
  }, [handleWheel, transform]);

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

  // Save the current canvas state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxt = canvas.getContext('2d');
    // Capture the entire canvas
    const imageData = ctxt.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, imageData]);
  }, []);

  // Undo: restore previous state from history
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

  const zoomIn = useCallback(() => {
    setTransform((prev) => {
      return {
        ...prev,
        scale: prev.scale + 0.1,
      };
    });
  }, []);

  // // Resumes the users last saved drawing on launch
  // useEffect(() => {
  // loadDrawing();
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
        onZoom={zoomIn}
      />
      <div
        className="canvas-container"
        // width={canvasSize.width}
        // onWheel={handleWheel}
        // height={canvasSize.height}
      >
        <canvas
          ref={canvasRef}
          id="canvas"
          aria-label="Drawing canvas" // Save to history on mouseup (final stroke)
          onMouseUp={saveToHistory}
          style={{ scale: transform.scale }}
          // width={canvasSize.width}
          // height={canvasSize.height}
          width={500}
          height={500}
        />
      </div>
    </>
  );
}

export default Canvas;
