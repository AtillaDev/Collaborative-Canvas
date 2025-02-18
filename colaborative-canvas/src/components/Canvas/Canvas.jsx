import { useCallback, useEffect, useRef, useState } from 'react';
import Toolbar from '../Toolbar/Toolbar';
// TODO: add pan functionality to the workspace

function Canvas() {
  const workspaceRef = useRef(null);
  const canvasRef = useRef(null);
  const paintingRef = useRef(false);

  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000');

  const [strokeHistory, setStrokeHistory] = useState([]);
  const [canvasSize, setCanvasSize] = useState({
    width: 1000,
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
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Add wheel handler for zooming
  const handleWheel = useCallback((e) => {
    e.preventDefault();
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
    const workspace = workspaceRef.current;
    if (!canvas) return;

    const ctxt = canvas.getContext('2d');

    function getCanvasPosition(e) {
      const rect = canvas.getBoundingClientRect();
      return [
        ((e.clientX - rect.left) * 2) / transform.scale,
        ((e.clientY - rect.top) * 2) / transform.scale,
        // ((e.clientX - rect.left - transform.y) * 2) / transform.scale,
        // ((e.clientY - rect.top - transform.x) * 2) / transform.scale,
      ];
    }

    // Points for smothing drawed strokes
    let points = [];

    function startPosition(e) {
      if (e.button !== 0) return; // Only run when left click is pressed
      paintingRef.current = true;

      // Cordinates of the mouse in the element
      let [xMouse, yMouse] = getCanvasPosition(e);
      // xMouse = xMouse + transform.x;
      // yMouse = yMouse + transform.y;
      points.push({ x: xMouse, y: yMouse });
      draw(e);
      // ctxt.lineWidth = brushSizeRef.current;
      ctxt.fillStyle = brushColorRef.current;
      ctxt.beginPath();
      ctxt.arc(xMouse, yMouse, brushSizeRef.current / 2, 0, Math.PI * 2);
      ctxt.fill();

      ctxt.beginPath();
      ctxt.moveTo(xMouse, yMouse);
    }

    function finishedPosition(e) {
      ctxt.stroke();
      ctxt.closePath();
      // Clear points after finishing the stroke
      points = [];
      paintingRef.current = false;

      e.preventDefault();
    }

    // Draw using smooth lines
    function draw(e) {
      if (!paintingRef.current) return;
      let [xMouse, yMouse] = getCanvasPosition(e);
      // xMouse = xMouse + transform.x;
      // yMouse = yMouse + transform.y;
      // Add current point
      points.push({ x: xMouse, y: yMouse });

      // For quadratic curves, we need at least 3 points
      if (points.length < 3) return;

      // Get the last three points
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      // Calculate midpoints for smoother curve
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctxt.lineWidth = brushSizeRef.current;
      ctxt.strokeStyle = brushColorRef.current;
      ctxt.lineJoin = 'round';
      ctxt.lineCap = 'round';

      ctxt.beginPath();
      // Start from the first midpoint
      ctxt.moveTo(mid1.x, mid1.y);
      // Draw quadratic curve using p1 as the control point, ending at the next midpoint
      ctxt.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctxt.stroke();
    }

    // Regular draw
    // function draw(e) {
    //   if (!paintingRef.current) return;

    //   const [x, y] = getCanvasPosition(e);

    //   ctxt.lineWidth = brushSizeRef.current;
    //   ctxt.strokeStyle = brushColorRef.current;
    //   ctxt.lineJoin = 'round';
    //   ctxt.lineCap = 'round';

    //   ctxt.lineTo(x, y);
    //   ctxt.stroke();
    //   ctxt.beginPath();
    //   ctxt.moveTo(x, y);
    // }

    workspace.addEventListener('wheel', handleWheel);
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    // Cleanup function: remove event listeners on unmount
    return () => {
      workspace.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', startPosition);
      canvas.removeEventListener('mouseup', finishedPosition);
      canvas.removeEventListener('mousemove', draw);
    };
  }, [transform, handleWheel]);

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

  const zoomOut = useCallback(() => {
    setTransform((prev) => {
      return {
        ...prev,
        scale: prev.scale - 0.1,
      };
    });
  }, []);

  function resizeWidth(widthForResize) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxt = canvas.getContext('2d');

    // Capture the current canvas as an image
    const dataURL = canvas.toDataURL();

    setCanvasSize((prev) => {
      if (strokeHistory <= 2) {
        loadDrawing();
      }
      if (widthForResize) {
        return { ...prev, width: widthForResize };
      }
    });

    // Use a timeout to wait for the canvas to resize
    setTimeout(() => {
      // Clear the canvas
      ctxt.clearRect(0, 0, canvas.width, canvas.height);

      // Load the last saved history state or the captured image
      if (strokeHistory.length > 2) {
        ctxt.putImageData(strokeHistory[strokeHistory.length - 1], 0, 0);
      } else {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => ctxt.drawImage(img, 0, 0);
      }
    }, 0);
  }

  function resizeHeight(heightForResize) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxt = canvas.getContext('2d');

    // Capture the current canvas as an image
    const dataURL = canvas.toDataURL();

    setCanvasSize((prev) => {
      if (strokeHistory <= 2) {
        loadDrawing();
      }
      if (heightForResize) {
        return { ...prev, height: heightForResize };
      }

      //REVIEW: IF  BUG WITH RESIZING IS FOUND CHECK THIS OUT
      // if (!heightForResize) {
      //   return { ...prev, height: 1 };
      // } else if (heightForResize >= 10000) {
      //   return { ...prev, height: 10000 };
      // } else {
      //   return { ...prev, height: heightForResize };
      // }
    });

    // Use a timeout to wait for the canvas to resize

    setTimeout(() => {
      // Clear the canvas
      ctxt.clearRect(0, 0, canvas.width, canvas.height);

      // Load the last saved history state or the captured image
      if (strokeHistory.length > 2) {
        ctxt.putImageData(strokeHistory[strokeHistory.length - 1], 0, 0);
      } else {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => ctxt.drawImage(img, 0, 0);
      }
    }, 0);
  }

  const startPan = (e) => {
    if (e.button !== 1) return;
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const stopPan = () => {
    isDragging.current = false;
  };

  const panCanvas = (e) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;

    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  // Resumes the users last saved drawing on launch
  useEffect(() => {
    loadDrawing();
  }, [loadDrawing]);

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
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        canvasSize={canvasSize}
        onResizeWidth={resizeWidth}
        onResizeHeight={resizeHeight}
      />
      <div
        className="workspace"
        ref={workspaceRef}
        // width={canvasSize.width}
        // onWheel={handleWheel}
        // height={canvasSize.height}
        onMouseDown={startPan} // Start panning on middle mouse
        onMouseUp={stopPan} // Stop panning
        onMouseLeave={stopPan} // Stop panning when leaving workspace
        onMouseMove={panCanvas} // Move the canvas
      >
        <canvas
          ref={canvasRef}
          id="canvas"
          aria-label="Drawing canvas" // Save to history on mouseup (final stroke)
          onMouseUp={saveToHistory}
          style={{
            width: canvasSize.width / 2,
            height: canvasSize.height / 2,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
          width={canvasSize.width}
          height={canvasSize.height}
          // width={500}
          // height={500}
        />
      </div>
    </>
  );
}

export default Canvas;
