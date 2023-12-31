"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTool, setSelectedTool] = useState("brush");
  const [brushWidth, setBrushWidth] = useState(5);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [prevMouseX, setPrevMouseX] = useState(0);
  const [prevMouseY, setPrevMouseY] = useState(0);
  const [filters, setFilters] = useState("grayscale(1)");

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
    console.log(`${canvas.width} and ${canvas.height}`);
    if (selectedImage && selectedFile) {
      const img = new Image();

      img.onload = () => {
        var canvas = ctx.canvas;
        var hRatio = canvas.width / img.width;
        var vRatio = canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);
        var centerShift_x = (canvas.width - img.width * ratio) / 2;
        var centerShift_y = (canvas.height - img.height * ratio) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = filters;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio
        );
      };
      img.src = URL.createObjectURL(selectedFile);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [selectedImage, selectedFile, filters]);

  return (
    <div className="flex bg-black flex-col gap-y-20">
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
                      setIsImageSelected(true);
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="flex p-2 space-x-4 justify-center">
            <button
              onClick={handleUpload}
              disabled={!isImageSelected}
              className={`${
                uploading
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100 cursor-pointer"
              } bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  disabled:bg-red-400 disabled:text-gray-100 `}
            >
              {uploading ? "Uploading.." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex mb-20 min-h-700 flex-row flex-wrap-reverse bg-white rounded container p-10 mx-auto">
        <section className=" w-1/4 ">
          <div className="row flex flex-col gap-3 mb-8">
            <label className=" text-gray-900 font-medium  text-lg">
              Shapes:
            </label>
            <ul className="flex flex-col gap-1.5">
              <li
                className={`p-1 inline rounded mr-20 pointer-events-auto text-center  ${
                  selectedTool === "rectangle"
                    ? "bg-blue-800 text-blue-100"
                    : "bg-blue-200 text-gray-700 "
                }`}
                id="circle"
                onClick={() => {
                  selectedTool === "rectangle"
                    ? setSelectedTool("brush")
                    : setSelectedTool("rectangle");
                }}
              >
                <span className="">Rectangle</span>
              </li>
              <li
                className={`p-1 inline rounded mr-20 pointer-events-auto text-center  ${
                  selectedTool === "circle"
                    ? "bg-blue-800 text-blue-100"
                    : "bg-blue-200 text-gray-700 "
                }`}
                id="circle"
                onClick={() => {
                  selectedTool === "circle"
                    ? setSelectedTool("brush")
                    : setSelectedTool("circle");
                }}
              >
                <span className=" ">Circle</span>
              </li>
              <li
                className={`p-1 inline rounded mr-20 pointer-events-auto text-center  ${
                  selectedTool === "triangle"
                    ? "bg-blue-800 text-blue-100"
                    : "bg-blue-200 text-gray-700 "
                }`}
                id="triangle"
                onClick={() => {
                  selectedTool === "triangle"
                    ? setSelectedTool("brush")
                    : setSelectedTool("triangle");
                }}
              >
                <span className="">Triangle</span>
              </li>
            </ul>
          </div>
          <div className="row flex flex-col gap-3 mb-5">
            <label className="block text-lg font-medium text-gray-900 ">
              Brush size:
            </label>

            <input
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700 "
              type="range"
              min="1"
              max="30"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
            />
          </div>
          <div className="row colors mb-5">
            <label className="mb-3 flex flex-row gap-2  text-gray-900 font-medium  text-lg">
              <span className="align-center">Color:</span>
            </label>
            <ul className=" flex justify-around items-center	content-center">
              <li
                className={`ring-2 ring-gray-400 bg-white border rounded h-5 w-5 my-1 
                 `}
                onClick={() => {
                  setSelectedColor("#ffffff");
                  setFilters("grayscale(1)");
                }}
              ></li>
              <li
                className={`ring-2 ring-gray-400  bg-black rounded h-5 w-5 my-1`}
                onClick={() => {
                  setSelectedColor("#000000");
                  setFilters("grayscale(1)");
                }}
              ></li>
              <li
                className={`ring-2 ring-gray-400 bg-red-500 rounded h-5 w-5 my-1 `}
                onClick={() => {
                  setSelectedColor("#ff0000");
                  setFilters("none");
                }}
              ></li>
              <li
                className={`ring-2 ring-gray-400 bg-green-500 rounded h-5 w-5 my-1`}
                onClick={() => {
                  setSelectedColor("#00ff00");
                  setFilters("none");
                }}
              ></li>
              <li>
                <input
                  className="option rounded h-10 w-10 "
                  type="color"
                  id="color-picker "
                  value={selectedColor || "#4A98F7"}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    setFilters("none");
                  }}
                />
              </li>
            </ul>
          </div>
          <div className="flex flex-col ">
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
            <span className="p-1 m-1 text-red-500">
              Note:black and white colour make it grayscale and if select any
              other colour than that it will make the backround image colourful
            </span>
          </div>
        </section>
        <section className="w-3/4 p-x-10">
          {selectedImage && (
            <canvas
              className="bg-white m-auto"
              height={600}
              width={700}
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
