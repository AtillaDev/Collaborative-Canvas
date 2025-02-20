import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';

function Toolbar({
  brushSize,
  brushColor,
  onBrushSizeChange,
  onBrushColorChange,
  onClearCanvas,
  onUndo,
  onSave,
  onLoad,
  onExport,
  onZoomIn,
  onZoomOut,
  canvasSize,
  onResizeWidth,
  onResizeHeight,
}) {
  const [resizeWidthInput, setResizeWidthInput] = useState(canvasSize.width);
  const [resizeHeightInput, setResizeHeightInput] = useState(canvasSize.height);

  const handleEnter = useCallback((e) => {
    // Allow: numbers (0-9), backspace, delete, arrow keys, enter, and one dot (.)
    if (
      !/[\d]/.test(e.key) && // Allow digits
      ![
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Enter',
      ].includes(e.key) &&
      e.key !== '.' // Allow a single decimal point
    ) {
      e.preventDefault();
    }

    // Prevent multiple dots
    if (e.key === '.' && e.target.value.includes('.')) {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      // Clear zeros in frot of the number like 0100 = 100
      // if (!value) {
      //   setInputValue(1);
      // } else if (value >= 10000) {
      //   setInputValue(10000);
      //   setValue(10000);
      // } else {
      //   setInputValue(value);
      // }

      e.target.blur();

      // setValue(value);
    }
  }, []);
  return (
    <div className="toolbar" style={{ padding: '10px', background: '#ccc' }}>
      <div className="resize-width-wrapper">
        <label htmlFor="resizeWidth">Canvas Width:</label>
        <input
          className="canvas-resize-input"
          type="number"
          id="resizeWidth"
          value={resizeWidthInput}
          onChange={(e) => {
            const newValue = Math.abs(Number(e.target.value));
            // Dont change value to 0 after second . is added
            if (/^\d*\.?\d*$/.test(newValue)) {
              setResizeWidthInput(newValue);
            }
          }}
          // On Unfocus
          onBlur={() => {
            if (!resizeWidthInput) {
              setResizeWidthInput(1);
              onResizeWidth(1);
            } else if (resizeWidthInput >= 10000) {
              setResizeWidthInput(10000);
              onResizeWidth(10000);
            } else {
              setResizeWidthInput(resizeWidthInput);
              onResizeWidth(resizeWidthInput);
            }
          }}
          onKeyDown={(e) => {
            handleEnter(e);
          }}
        />
      </div>
      <div className="resize-height-wrapper">
        <label htmlFor="resizeHeight">Canvas Height:</label>
        <input
          className="canvas-resize-input"
          type="number"
          id="resizeHeight"
          value={resizeHeightInput}
          onChange={(e) => {
            const newValue = Math.abs(Number(e.target.value));
            // Dont change value to 0 after second . is added
            if (/^\d*\.?\d*$/.test(newValue)) {
              setResizeHeightInput(newValue);
            }
          }}
          // On Unfocus
          onBlur={() => {
            if (!resizeHeightInput) {
              setResizeHeightInput(1);
              onResizeHeight(1);
            } else if (resizeHeightInput >= 10000) {
              setResizeHeightInput(10000);
              onResizeHeight(10000);
            } else {
              setResizeHeightInput(resizeHeightInput);
              onResizeHeight(resizeHeightInput);
            }
          }}
          onKeyDown={(e) => {
            handleEnter(e);
          }}
        />
      </div>

      <label htmlFor="brushSize" className="brush-size-slider-label">
        Brush Size: {brushSize}
      </label>
      <input
        className="brush-size-slider"
        id="brushSize"
        type="range"
        min="1"
        max="100"
        value={brushSize}
        onChange={(e) => onBrushSizeChange(Number(e.target.value))}
      />

      {/* Color picker */}
      <label htmlFor="brushColor" className="color-picker-label">
        Brush Color: {brushColor}
      </label>
      <input
        className="color-picker"
        type="color"
        id="brushColor"
        value={brushColor}
        onChange={(e) => onBrushColorChange(e.target.value)}
      ></input>

      {/* Clear btn */}
      <button onClick={onClearCanvas} type="button" className="clear-btn">
        Clear
      </button>
      <button onClick={onUndo} type="button" className="clear-btn">
        Undo
      </button>

      {/* Save & Load btns */}
      <div className="store-btns">
        <button onClick={onSave} type="button" className="clear-btn">
          Save
        </button>
        <button onClick={onLoad} type="button" className="clear-btn">
          Load
        </button>
      </div>

      {/* Export btn */}
      <button onClick={onExport} type="button">
        Export
      </button>

      <button onClick={onZoomIn} type="button">
        Zoom In
      </button>
      <button onClick={onZoomOut} type="button">
        Zoom Out
      </button>
    </div>
  );
}

Toolbar.propTypes = {
  brushSize: PropTypes.number.isRequired,
  onBrushSizeChange: PropTypes.func.isRequired,

  brushColor: PropTypes.string.isRequired,
  onBrushColorChange: PropTypes.func.isRequired,
  onClearCanvas: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,

  onLoad: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,

  onExport: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,

  canvasSize: PropTypes.object.isRequired,
  onResizeWidth: PropTypes.func.isRequired,
  onResizeHeight: PropTypes.func.isRequired,
};

export default Toolbar;
