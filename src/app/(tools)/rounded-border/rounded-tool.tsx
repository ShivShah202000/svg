"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";

import {
  useFileUploader,
  type FileUploaderResult,
} from "@/hooks/use-file-uploader";
import { FileDropzone } from "@/components/shared/file-dropzone";

type Radius = number;
type BackgroundOption = "white" | "black" | "transparent";

function useImageConverter(props: {
  canvas: HTMLCanvasElement | null;
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height } = useMemo(() => {
    return {
      width: props.imageMetadata.width,
      height: props.imageMetadata.height,
    };
  }, [props.imageMetadata]);

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const imageFileName = props.imageMetadata.name ?? "image_converted";
        link.download = `${imageFileName.replace(/\..+$/, "")}.png`;
        link.click();
      }
    };

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = props.background;
      ctx.fillRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(props.radius, 0);
      ctx.lineTo(width - props.radius, 0);
      ctx.quadraticCurveTo(width, 0, width, props.radius);
      ctx.lineTo(width, height - props.radius);
      ctx.quadraticCurveTo(width, height, width - props.radius, height);
      ctx.lineTo(props.radius, height);
      ctx.quadraticCurveTo(0, height, 0, height - props.radius);
      ctx.lineTo(0, props.radius);
      ctx.quadraticCurveTo(0, 0, props.radius, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, width, height);
      saveImage();
    };

    img.src = props.imageContent;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

interface ImageRendererProps {
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
}

const ImageRenderer = ({
  imageContent,
  radius,
  background,
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const imgElement = containerRef.current.querySelector("img");
      if (imgElement) {
        imgElement.style.borderRadius = `${radius}px`;
      }
    }
  }, [imageContent, radius]);

  return (
    <div ref={containerRef} className="relative w-[500px] max-w-full">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: background, borderRadius: `${radius}px` }}
      />
      <img
        src={imageContent}
        alt="Preview"
        className="relative"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
          borderRadius: `${radius}px`,
        }}
      />
    </div>
  );
};

function SaveAsPngButton({
  imageContent,
  radius,
  background,
  imageMetadata,
}: {
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useImageConverter({
    canvas: canvasRef,
    imageContent,
    radius,
    background,
    imageMetadata,
  });

  const plausible = usePlausible();

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <button
        onClick={() => {
          plausible("convert-image-to-png");
          void convertToPng();
        }}
        className="rounded-lg bg-[#27175D] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#27175D]/90"
      >
        Save as PNG
      </button>
    </div>
  );
}

function RoundedToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;
  const [radius, setRadius] = useLocalStorage<Radius>("roundedTool_radius", 2);
  const [isCustomRadius, setIsCustomRadius] = useState(false);
  const [background, setBackground] = useLocalStorage<BackgroundOption>(
    "roundedTool_background",
    "transparent",
  );

  const handleRadiusChange = (value: number | "custom") => {
    if (value === "custom") {
      setIsCustomRadius(true);
    } else {
      setRadius(value);
      setIsCustomRadius(false);
    }
  };

  if (!imageMetadata) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex w-full flex-1 flex-col px-4 py-8">
          <h1 className="mb-8 text-center text-3xl font-bold text-[#27175D]">
            Corner Rounder
          </h1>

          <div className="mx-auto w-full max-w-2xl">
            <div className="w-full rounded-xl bg-white p-8 shadow-sm">
              <UploadBox
                title="Add rounded corners to your images. Quick and easy."
                subtitle="Drag and drop your image here, or click to upload"
                description="Upload Image"
                accept="image/*"
                onChange={handleFileUploadEvent}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex w-full flex-1 flex-col px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#27175D]">
          Corner Rounder
        </h1>

        <div className="mx-auto w-full max-w-4xl rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6">
            {/* Preview Section */}
            <div className="w-full rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex justify-center">
                <ImageRenderer
                  imageContent={imageContent}
                  radius={radius}
                  background={background}
                />
              </div>
              <p className="mt-2 text-center text-sm text-gray-600">
                {imageMetadata.name}
              </p>
            </div>

            {/* Image Size */}
            <div className="w-full rounded-lg bg-gray-50 p-4">
              <div className="text-center">
                <span className="text-sm font-medium text-gray-900">
                  Image Size
                </span>
                <p className="mt-1 font-medium text-gray-700">
                  {imageMetadata.width} × {imageMetadata.height}
                </p>
              </div>
            </div>

            {/* Border Radius Controls */}
            <div className="w-full rounded-lg bg-gray-50 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Border Radius
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[2, 4, 8, 16, 32, 64].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRadiusChange(value)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      !isCustomRadius && radius === value
                        ? "bg-[#27175D] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {value}px
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={radius}
                    onChange={(e) => {
                      setRadius(parseInt(e.target.value || "0", 10));
                      setIsCustomRadius(true);
                    }}
                    className="w-20 rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-900"
                    min="0"
                  />
                  <span className="text-sm text-gray-600">px</span>
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="w-full rounded-lg bg-gray-50 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Background Color
              </label>
              <div className="mt-2 flex gap-2">
                {["white", "black", "transparent"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackground(color as BackgroundOption)}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      background === color
                        ? "bg-[#27175D] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={cancel}
                className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
              >
                Cancel
              </button>
              <SaveAsPngButton
                imageContent={imageContent}
                radius={radius}
                background={background}
                imageMetadata={imageMetadata}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoundedTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <RoundedToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
