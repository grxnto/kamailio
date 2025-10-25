"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full pt-8 sm:px-8 flex justify-between items-center px-4 relative">
      {/* Logo */}
      <a
        className="hover:underline hover:underline-offset-4 flex text-xl font-bold text-white justify-center"
        href="https://github.com/grxnto/kamailio"
        target="_blank"
        rel="noopener noreferrer"
      >
        Kamaʻilio
      </a>

      {/* Desktop navigation */}
      <nav className="hidden sm:flex gap-6 text-sm">
        <a href="#about" className="hover:underline hover:underline-offset-4">Record</a>
        <a href="#features" className="hover:underline hover:underline-offset-4">Upload</a>
        <a href="#contact" className="hover:underline hover:underline-offset-4">About</a>
      </nav>

      {/* Mobile menu button */}
      <button
        className="sm:hidden rounded-md text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute right-8 top-full mt-2 w-40 bg-gray-800 text-white rounded-md shadow-lg flex flex-col gap-2 p-3 sm:hidden">
          <a href="#about" className="hover:underline hover:underline-offset-4">Record</a>
          <a href="#features" className="hover:underline hover:underline-offset-4">Upload</a>
          <a href="#contact" className="hover:underline hover:underline-offset-4">About</a>
        </div>
      )}
    </header>
  );
}
