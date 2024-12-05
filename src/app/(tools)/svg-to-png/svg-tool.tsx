"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { SVGScaleSelector } from "@/components/svg-scale-selector";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { FileDropzone } from "@/components/shared/file-dropzone";

export type Scale = "custom" | number;

function scaleSvg(svgContent: string, scale: number) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  svgElement.setAttribute("width", scaledWidth.toString());
  svgElement.setAttribute("height", scaledHeight.toString());

  return new XMLSerializer().serializeToString(svgDoc);
}

function useSvgConverter(props: {
  canvas: HTMLCanvasElement | null;
  svgContent: string;
  scale: number;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height, scaledSvg } = useMemo(() => {
    const scaledSvg = scaleSvg(props.svgContent, props.scale);

    return {
      width: props.imageMetadata.width * props.scale,
      height: props.imageMetadata.height * props.scale,
      scaledSvg,
    };
  }, [props.svgContent, props.scale, props.imageMetadata]);

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const svgFileName = props.imageMetadata.name ?? "svg_converted";
        link.download = `${svgFileName.replace(".svg", "")}-${props.scale}x.png`;
        link.click();
      }
    };

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveImage();
    };

    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scaledSvg)}`;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

function SVGRenderer({ svgContent }: { svgContent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent;
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
      }
    }
  }, [svgContent]);

  return <div ref={containerRef} className="max-h-[400px] w-full" />;
}

function SaveAsPngButton({
  svgContent,
  scale,
  imageMetadata,
}: {
  svgContent: string;
  scale: number;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef,
    svgContent,
    scale,
    imageMetadata,
  });

  const plausible = usePlausible();

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <button
        onClick={() => {
          plausible("convert-svg-to-png");
          void convertToPng();
        }}
        className="rounded-lg bg-[#27175D] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#27175D]/90"
      >
        Save as PNG
      </button>
    </div>
  );
}

function SVGToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { rawContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", 1);
  const [customScale, setCustomScale] = useLocalStorage<number>(
    "svgTool_customScale",
    1,
  );

  const effectiveScale = scale === "custom" ? customScale : scale;

  if (!imageMetadata)
    return (
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex w-full flex-1 flex-col px-4 py-8">
          <h1 className="mb-8 text-center text-3xl font-bold text-[#27175D]">
            SVG to PNG Converter
          </h1>
          
          <div className="mx-auto w-full max-w-2xl">
            <div className="w-full rounded-xl bg-white p-8 shadow-sm">
              <UploadBox
                title="Convert SVG files to PNG format. Fast and free."
                subtitle="Drag and drop your SVG here, or click to upload"
                description="Upload SVG"
                accept=".svg"
                onChange={handleFileUploadEvent}
              />
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex w-full flex-1 flex-col px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#27175D]">
          SVG to PNG Converter
        </h1>
        
        <div className="mx-auto w-full max-w-4xl rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6">
            {/* Preview Section */}
            <div className="w-full rounded-lg border border-gray-100 bg-gray-50 p-4">
              <SVGRenderer svgContent={rawContent} />
              <p className="mt-2 text-center text-sm text-gray-600">
                {imageMetadata.name}
              </p>
            </div>

            {/* Size Information */}
            <div className="grid w-full grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <span className="text-sm text-gray-500">Original Size</span>
                <p className="text-gray-900">
                  {imageMetadata.width} × {imageMetadata.height}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <span className="text-sm text-gray-500">Scaled Size</span>
                <p className="text-gray-900">
                  {imageMetadata.width * effectiveScale} ×{" "}
                  {imageMetadata.height * effectiveScale}
                </p>
              </div>
            </div>

            {/* Scale Controls */}
            <div className="w-full rounded-lg bg-gray-50 p-4">
              <SVGScaleSelector
                title="Scale Factor"
                options={[1, 2, 4, 8, 16, 32, 64]}
                selected={scale}
                onChange={setScale}
                customValue={customScale}
                onCustomValueChange={setCustomScale}
              />
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
                svgContent={rawContent}
                scale={effectiveScale}
                imageMetadata={imageMetadata}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SVGTool() {
  const fileUploaderProps = useFileUploader();
  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/svg+xml", ".svg"]}
      dropText="Drop SVG file"
    >
      <SVGToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}