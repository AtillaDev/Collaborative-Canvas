function Toolbar({ brushWidth, onBrushSizeChange }) {
  return (
    <div style={{ padding: '10px', background: '#ccc' }}>
      <label htmlFor="brushSize">Brush Size: {brushWidth}</label>
      <input
        id="brushSize"
        type="range"
        min="1"
        max="100"
        value={brushWidth}
        onChange={(e) => onBrushSizeChange(Number(e.target.value))}
      />
    </div>
  );
}

export default Toolbar;
