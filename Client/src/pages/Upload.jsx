// Upload.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { toast } from 'react-toastify';
import { posterAPI } from '../services/api';

const defaultStyle = {
  fontSize: 20,
  fontFamily: 'Arial',
  color: '#000000',
  bold: false,
  italic: false,
};

const Upload = () => {
  const [category, setCategory] = useState('');
  const [posterFile, setPosterFile] = useState(null);
  const [posterSrc, setPosterSrc] = useState('');
  const [imgSize, setImgSize] = useState({ width: 400, height: 560 });
  const [loading, setLoading] = useState(false);

  const [elements, setElements] = useState({
    companyName: {
      x: 40,
      y: 60,
      width: 200,
      height: 50,
      text: '',
      style: { ...defaultStyle },
    },
    whatsapp: {
      x: 40,
      y: 140,
      width: 200,
      height: 50,
      text: '',
      style: { ...defaultStyle },
    },
    website: {
      x: 40,
      y: 220,
      width: 200,
      height: 50,
      text: '',
      style: { ...defaultStyle },
    },
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePosterChange = (e) => {
    if (!category) {
      toast.error('Please select a category first!');
      e.target.value = '';
      return;
    }

    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 400;
          const ratio = img.width / img.height;
          const width = maxWidth;
          const height = maxWidth / ratio;
          setImgSize({ width, height });
          setPosterSrc(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image!');
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (!posterSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = posterSrc;

    image.onload = () => {
      canvas.width = imgSize.width;
      canvas.height = imgSize.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      Object.entries(elements).forEach(([key, val]) => {
        if (val.text.trim() !== '') {
          const { fontSize, fontFamily, color, bold, italic } = val.style;
          const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
          ctx.font = fontStyle;
          ctx.fillStyle = color;
          ctx.textBaseline = 'top';
          ctx.fillText(val.text, val.x + 5, val.y + 5);
        }
      });
    };
  }, [posterSrc, imgSize, elements]);

  const handleStyleChange = (key, prop, value) => {
    let newValue = value;
    if (prop === 'fontSize') {
      const parsed = parseInt(value, 10);
      newValue = Number.isNaN(parsed) || parsed <= 0 ? defaultStyle.fontSize : parsed;
    }
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        style: {
          ...prev[key].style,
          [prop]: newValue,
        },
      },
    }));
  };

  const handleTextChange = (key, newText) => {
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        text: newText,
      },
    }));
  };

  const onDragStop = (key, e, d) => {
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        x: d.x,
        y: d.y,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!posterSrc || !category) {
      return toast.error('Please upload an image and select category!');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('posters', posterFile);
      formData.append('category', category);

      const placeholders = Object.entries(elements).map(([key, val]) => ({
        key,
        x: val.x,
        y: val.y,
        width: val.width,
        height: val.height,
        text: val.text, // This will be populated with customer data later
        style: {
          fontSize: `${val.style.fontSize}px`,
          fontWeight: val.style.bold ? 'bold' : 'normal',
          color: val.style.color,
          fontFamily: val.style.fontFamily,
        },
        textAlign: 'left'
      }));
      console.log(placeholders)
      formData.append('placeholders', JSON.stringify(placeholders));

      await posterAPI.uploadPoster(formData);

      toast.success('Poster uploaded successfully!');
      setCategory('');
      setPosterFile(null);
      setPosterSrc('');
      setElements({
        companyName: {
          x: 40,
          y: 60,
          width: 200,
          height: 50,
          text: '',
          style: { ...defaultStyle },
        },
        whatsapp: {
          x: 40,
          y: 140,
          width: 200,
          height: 50,
          text: '',
          style: { ...defaultStyle },
        },
        website: {
          x: 40,
          y: 220,
          width: 200,
          height: 50,
          text: '',
          style: { ...defaultStyle },
        },
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Upload failed!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Upload Poster</h2>

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Select Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose Category --</option>
              <option value="offers">Offers</option>
              <option value="events">Events</option>
              <option value="festivals">Festivals</option>
            </select>
          </div>

          {/* Upload Poster */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-1">Upload Poster</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterChange}
              ref={fileInputRef}
              required
              className="w-full"
            />
          </div>

          {/* Preview Area */}
          {posterSrc && (
            <div
              className="relative border border-gray-300 rounded-md mx-auto mb-8"
              style={{ width: imgSize.width, height: imgSize.height }}
            >
              <img
                src={posterSrc}
                alt="Poster Preview"
                className="w-full h-full object-contain"
                draggable={false}
              />

              {/* Draggable text overlays */}
              {Object.entries(elements).map(([key, val]) => (
                <Rnd
                  key={key}
                  size={{ width: val.width, height: val.height }}
                  position={{ x: val.x, y: val.y }}
                  onDragStop={(e, d) => onDragStop(key, e, d)}
                  bounds="parent"
                  enableResizing={false}
                >
                  <input
                    type="text"
                    placeholder={key}
                    value={val.text}
                    onChange={(e) => handleTextChange(key, e.target.value)}
                    className="text-input w-full h-full px-1 border border-dotted border-gray-400 focus:outline-none bg-transparent"
                    style={{
                      fontSize: val.style.fontSize,
                      fontFamily: val.style.fontFamily,
                      color: val.style.color,
                      fontWeight: val.style.bold ? 'bold' : 'normal',
                      fontStyle: val.style.italic ? 'italic' : 'normal',
                    }}
                  />
                </Rnd>
              ))}
            </div>
          )}

          {/* Style Controls */}
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(elements).map(([key, val]) => (
              <div key={key} className="border rounded-md p-4 bg-gray-50">
                <h4 className="font-semibold mb-2 capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</h4>
                <label className="block text-sm font-medium mb-1">Text</label>
                <input
                  type="text"
                  value={val.text}
                  onChange={(e) => handleTextChange(key, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
                <label className="block mt-2 text-sm font-medium mb-1">Font Size</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={val.style.fontSize}
                  onChange={(e) => handleStyleChange(key, 'fontSize', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
                <label className="block mt-2 text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={val.style.color}
                  onChange={(e) => handleStyleChange(key, 'color', e.target.value)}
                  className="w-full h-8"
                />
                <div className="flex gap-4 mt-3">
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={val.style.bold}
                      onChange={(e) => handleStyleChange(key, 'bold', e.target.checked)}
                    />
                    <span>Bold</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={val.style.italic}
                      onChange={(e) => handleStyleChange(key, 'italic', e.target.checked)}
                    />
                    <span>Italic</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-8 w-full py-3 text-white font-semibold rounded-md ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Poster'}
          </button>
        </form>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default Upload;
