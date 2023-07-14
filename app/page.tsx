"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTool, setSelectedTool] = useState("brush");
  const [brushWidth, setBrushWidth] = useState(5);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [prevMouseX, setPrevMouseX] = useState(0);
  const [prevMouseY, setPrevMouseY] = useState(0);

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("myImage", selectedFile);
      console.log(formData);
    } catch (error: any) {
      console.log(error.response?.data);
    }
    setUploading(false);
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setPrevMouseX(x);
    setPrevMouseY(y);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!isDrawing || !ctx || !canvas) return;

    ctx.putImageData(snapshot!, 0, 0);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = selectedColor || "black";

    if (selectedTool === "brush") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (selectedTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (selectedTool === "rectangle") {
      const width = x - prevMouseX;
      const height = y - prevMouseY;
      ctx.strokeRect(prevMouseX, prevMouseY, width, height);
    } else if (selectedTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(x - prevMouseX, 2) + Math.pow(y - prevMouseY, 2)
      );
      ctx.beginPath();
      ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (selectedTool === "triangle") {
      ctx.beginPath();
      ctx.moveTo(prevMouseX, prevMouseY);
      ctx.lineTo(x, y);
      ctx.lineTo(prevMouseX * 2 - x, y);
      ctx.closePath();
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    if (selectedImage && selectedFile) {
      const image = new Image();

      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
       
      };
      image.src = URL.createObjectURL(selectedFile);
      ctx.filter = 'grayscale(1)';
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [selectedImage, selectedFile]);

  return (
    <div>
      <div className="flex justify-center mt-8">
        <div className="rounded-lg shadow-xl bg-gray-50 lg:w-1/2">
          <div className="m-4">
            <label className="inline-block mb-2 text-gray-500">
              Upload Image(jpg,png,svg,jpeg)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-gray-400 group-hover:text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <div className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                    <div className="">
                      {selectedImage ? (
                        <span>{selectedImage}</span>
                      ) : (
                        <span>Select Image</span>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="opacity-0"
                  onChange={({ target }) => {
                    if (target.files) {
                      const file = target.files[0];
                      setSelectedImage(URL.createObjectURL(file));
                      setSelectedFile(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="flex p-2 space-x-4 justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`${
                uploading
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100 cursor-pointer"
              } bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
            >
              {uploading ? "Uploading.." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-row bg-white rounded container mx-auto">
        <section className=" w-1/4  p-5">
          <div className="row mb-5">
            <label className=" mb-3 text-gray-800 text-lg">Shapes:</label>
            <ul className="options">
              <li
                className={`option tool flex items-center mb-1 ${
                  selectedTool === "rectangle" ? "active" : ""
                }`}
                id="rectangle"
                onClick={() => setSelectedTool("rectangle")}
              >

                <span className="text-gray-700">Rectangle</span>
              </li>
              <li
                className={`option tool flex items-center mb-1 ${
                  selectedTool === "circle" ? "active" : ""
                }`}
                id="circle"
                onClick={() => setSelectedTool("circle")}
              >
                <span className="text-gray-700">Circle</span>
              </li>
              <li
                className={`option tool flex items-center ${
                  selectedTool === "triangle" ? "active" : ""
                }`}
                id="triangle"
                onClick={() => setSelectedTool("triangle")}
              >
                <span className="text-gray-700">Triangle</span>
              </li>
            </ul>
          </div>
          <div className="row mb-5">
            <label className="mb-3 text-lg  text-gray-800">Options:</label>
            <ul className="options">
              <li
                className={` active tool flex items-center mb-2 ${
                  selectedTool === "brush" ? "active" : ""
                }`}
                id="brush"
                onClick={() => setSelectedTool("brush")}
              >
                <span className="text-gray-700">Brush</span>
              </li>
              <li className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                <input
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-500"
                  type="range"
                  id="size-slider"
                  min="1"
                  max="30"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(Number(e.target.value))}
                />
              </li>
            </ul>
          </div>
          <div className="row colors">
            <label className="title mb-3 text-gray-800">Colors</label>
            <ul className="options flex justify-between">
              <li
                className={`option bg-white border border-gray-300 rounded h-5 w-5 my-1 ${
                  selectedColor === "#ffffff" ? "selected" : ""
                }`}
                onClick={() => setSelectedColor("#ffffff")}
              ></li>
              <li
                className={`option selected bg-black rounded h-5 w-5 my-1 ${
                  selectedColor === "#000000" ? "selected" : ""
                }`}
                onClick={() => setSelectedColor("#000000")}
              ></li>
              <li
                className={`option bg-red-500 rounded h-5 w-5 my-1 ${
                  selectedColor === "#ff0000" ? "selected" : ""
                }`}
                onClick={() => setSelectedColor("#ff0000")}
              ></li>
              <li
                className={`option bg-green-500 rounded h-5 w-5 my-1 ${
                  selectedColor === "#00ff00" ? "selected" : ""
                }`}
                onClick={() => setSelectedColor("#00ff00")}
              ></li>
              <li>
                <input
                  className="option rounded h-10 w-10 "
                  type="color"
                  id="color-picker "
                  value={selectedColor || "#4A98F7"}
                  onChange={(e) => setSelectedColor(e.target.value)}
                />
              </li>
            </ul>
          </div>
          <div className="flex flex-col 	">
            <button
              className="m-1 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              onClick={() => {
                const canvas = canvasRef.current;
                setSelectedFile(null);
                setSelectedImage("");
                const ctx = canvas?.getContext("2d");
                if (!ctx || !canvas) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }}
            >
              Clear All
            </button>
            <button
              className="m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                const link = document.createElement("a");
                link.download = `${Date.now()}.jpg`;
                link.href = canvas.toDataURL();
                link.click();
              }}
            >
              Save As Image
            </button>
          </div>
        </section>
        <section className="w-3/4">
          {selectedImage && (
            <canvas
              className="bg-white m-auto"
              width={400}
              height={500}
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={drawing}
              onMouseUp={() => setIsDrawing(false)}
            ></canvas>
          )}
        </section>
      </div>
    </div>
  );
}
