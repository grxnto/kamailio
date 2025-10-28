"use client";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email) {
      console.log("Subscribing:", email);
      // Add your newsletter subscription logic here
      setEmail("");
    }
  };

  return (
    <footer className="w-full text-white border-t border-white mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Sitemap */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-400">Site</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="hover:text-gray-300 transition-colors">
                  Record
                </a>
              </li>
              <li>
                <a href="/features" className="hover:text-gray-300 transition-colors">
                  Upload
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-300 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-400">Contact</h3>
            <div className="space-y-2">
              <p>Grant Lau</p>
              <p>
                <a href="tel:+1234567890" className="hover:text-gray-300 transition-colors">
                  +1 808 859 8747
                </a>
              </p>
              <p>
                <a href="grant@purplemaia.org" className="hover:text-gray-300 transition-colors">
                  grant@purplemaia.org
                </a>
              </p>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-400">Info</h3>
            <div className="space-y-2">
                <p>
                    <a href="https://github.com/grxnto" className="hover:text-gray-300 transition-colors">
                        https://github.com/grxnto
                    </a>
                </p>
                <p >
                    <a href="www.linkedin.com/in/grant-lau" className="hover:text-gray-300 transition-colors">
                        www.linkedin.com/in/grant-lau
                    </a>
                </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}