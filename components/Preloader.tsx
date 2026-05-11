"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Preloader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by showing a neutral state until mounted
  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/logo_light.png"
    : "/logo_dark.png";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0d1b2a] dark:to-[#1b263b]">
      {/* Logo */}
      <div className="mb-12">
        <Image
          src={logoSrc}
          alt="ScopsTrade"
          width={300}
          height={75}
          className="w-64 h-auto"
          priority
        />
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
