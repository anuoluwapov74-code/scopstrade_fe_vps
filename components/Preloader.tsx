"use client";

export default function Preloader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0d1b2a] dark:to-[#1b263b]">
      {/* Logo */}
      <div className="mb-12">
        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Trade<span className="text-blue-600 dark:text-blue-500">Scops</span>
        </span>
      </div>

      {/* Circular Loading Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
      </div>

      {/* Loading Text */}
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
