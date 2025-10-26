"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sm:w-[90%] w-full pt-8 sm:px-8 flex flex-col px-6">
      {/* Top bar */}
      <div className="flex justify-between items-center">
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
      </div>

      {/* Mobile dropdown with smooth push-down */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            layout
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="sm:hidden origin-top overflow-hidden flex flex-col gap-2 mt-2 bg-gray-800 text-white rounded-md p-3"
          >
            <a
              href="#about"
              className="hover:underline hover:underline-offset-4"
              onClick={() => setMenuOpen(false)}
            >
              Record
            </a>
            <a
              href="#features"
              className="hover:underline hover:underline-offset-4"
              onClick={() => setMenuOpen(false)}
            >
              Upload
            </a>
            <a
              href="#contact"
              className="hover:underline hover:underline-offset-4"
              onClick={() => setMenuOpen(false)}
            >
              About
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
