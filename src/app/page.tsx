"use client";

import React from "react";
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="animate-fade-in mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-indigo-900">EasyPicZ</h1>
          <p className="animate-fade-in-delayed text-lg text-gray-600">
            I buid these tools because the exisitng online tools are not that
            good ( for me :)
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* SVG to PNG Converter */}
          <Link href="/svg-to-png" className="group">
            <div className="h-full rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                <span className="text-2xl">🖼️</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                SVG to PNG
              </h2>
              <p className="text-gray-600">
                Convert vector graphics to high-quality PNG images instantly
              </p>
            </div>
          </Link>

          {/* Square Image Generator */}
          <Link href="/square-image" className="group">
            <div className="h-full rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                <span className="text-2xl">⬛</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                Square Image
              </h2>
              <p className="text-gray-600">
                Generate perfect square images for your social media needs
              </p>
            </div>
          </Link>

          {/* Corner Rounder */}
          <Link href="/rounded-border" className="group">
            <div className="h-full rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-colors duration-300 group-hover:bg-purple-600 group-hover:text-white">
                <span className="text-2xl">📐</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                Corner Rounder
              </h2>
              <p className="text-gray-600">
                Add smooth, professional rounded corners to any image
              </p>
            </div>
          </Link>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-delayed {
          animation: fadeIn 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Home;
