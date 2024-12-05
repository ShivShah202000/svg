"use client";

import { usePlausible } from "next-plausible";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";

function SquareToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [backgroundColor, setBackgroundColor] = useLocalStorage<
    "black" | "white"
  >("squareTool_backgroundColor", "white");

  const [squareImageContent, setSquareImageContent] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (imageContent && imageMetadata) {
      const canvas = document.createElement("canvas");
      const size = Math.max(imageMetadata.width, imageMetadata.height);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);

      const img = new Image();
      img.onload = () => {
        const x = (size - imageMetadata.width) / 2;
        const y = (size - imageMetadata.height) / 2;
        ctx.drawImage(img, x, y);
        setSquareImageContent(canvas.toDataURL("image/png"));
      };
      img.src = imageContent;
    }
  }, [imageContent, imageMetadata, backgroundColor]);

  const handleSaveImage = () => {
    if (squareImageContent && imageMetadata) {
      const link = document.createElement("a");
      link.href = squareImageContent;
      const originalFileName = imageMetadata.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;
      link.download = `${fileNameWithoutExtension}-squared.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const plausible = usePlausible();

  if (!imageMetadata) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex w-full flex-1 flex-col px-4 py-8">
          <h1 className="mb-8 text-center text-3xl font-bold text-[#27175D]">
            Square Image Generator
          </h1>
          
          <div className="mx-auto w-full max-w-2xl">
            <div className="w-full rounded-xl bg-white p-8 shadow-sm">
              <UploadBox
                title="Create square images with custom backgrounds. Fast and free."
                subtitle="Drag and drop your image here, or click to upload"
                description="Upload Image"
                accept="image/*"
                onChange={handleFileUploadEvent}              />
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
          Square Image Generator
        </h1>
        
        <div className="mx-auto w-full max-w-4xl rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6">
            {/* Preview Section */}
            <div className="w-full rounded-lg border border-gray-100 bg-gray-50 p-4">
              {squareImageContent && (
                <img 
                  src={squareImageContent} 
                  alt="Preview" 
                  className="mx-auto max-h-[400px] object-contain" 
                />
              )}
              <p className="mt-2 text-center text-sm text-gray-600">
                {imageMetadata.name}
              </p>
            </div>

            {/* Size Information */}
            <div className="grid w-full grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <span className="text-sm text-gray-600">Original Size</span>
                <p className="text-gray-900">
                  {imageMetadata.width} × {imageMetadata.height}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <span className="text-sm text-gray-600">Square Size</span>
                <p className="text-gray-900">
                  {Math.max(imageMetadata.width, imageMetadata.height)} ×{" "}
                  {Math.max(imageMetadata.width, imageMetadata.height)}
                </p>
              </div>
            </div>

            {/* Background Color Selector */}
            <div className="w-full rounded-lg bg-gray-50 p-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-900">Background Color</span>
                <div className="flex gap-2">
                  {["white", "black"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color as "white" | "black")}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                        backgroundColor === color
                          ? "bg-[#27175D] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  ))}
                </div>
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
              <button
                onClick={() => {
                  plausible("create-square-image");
                  handleSaveImage();
                }}
                className="rounded-lg bg-[#27175D] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#27175D]/90"
              >
                Save Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SquareTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <SquareToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}