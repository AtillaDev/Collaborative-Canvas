import PropTypes from 'prop-types';

function Toolbar({
  brushSize,
  brushColor,
  onBrushSizeChange,
  onBrushColorChange,
  onClearCanvas,
  onUndo,
  onSave,
  onLoad,
}) {
  return (
    <div style={{ padding: '10px', background: '#ccc' }}>
      {/* Brush size slider */}
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

      <div className="store-btns">
        <button onClick={onSave} type="button" className="clear-btn">
          Save
        </button>
        <button onClick={onLoad} type="button" className="clear-btn">
          Load
        </button>
      </div>
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
};

export default Toolbar;
