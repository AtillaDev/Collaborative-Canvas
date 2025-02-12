import { useEffect } from 'react';

function Canvas() {
  useEffect(() => {
    const handleLoad = () => {
      const canvas = document.querySelector('#canvas');
      const ctxt = canvas.getContext('2d');
      let painting = false;

      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;

      ctxt.lineWidth = 10;
      ctxt.lineCap = 'round';

      function startPostion(e) {
        painting = true;

        ctxt.beginPath();
        ctxt.arc(e.clientX, e.clientY, ctxt.lineWidth / 2, 0, Math.PI * 2);
        ctxt.fill();
        // Start a new path for subsequent drawing
        ctxt.beginPath();
        ctxt.moveTo(e.clientX, e.clientY);
      }
      function finishedPosition() {
        painting = false;
        ctxt.beginPath();
      }

      function draw(e) {
        if (!painting) return;
        // ctxt.lineWidth = 10;
        // ctxt.lineCap = 'round';

        ctxt.lineTo(e.clientX, e.clientY);
        ctxt.stroke();
        ctxt.beginPath();
        ctxt.moveTo(e.clientX, e.clientY);
      }

      canvas.addEventListener('mousedown', startPostion);
      canvas.addEventListener('mouseup', finishedPosition);
      canvas.addEventListener('mousemove', draw);
    };

    window.addEventListener('load', handleLoad);

    // Clean up
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return <canvas id="canvas"></canvas>;
}

export default Canvas;
