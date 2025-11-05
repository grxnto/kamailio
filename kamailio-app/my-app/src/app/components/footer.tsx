"use client";

export default function Footer() {

  const scrollToRecorder = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("recorder")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <footer className="mt-15 w-full text-white border-t border-white mt-auto bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {/* Sitemap */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-400">Site</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#recorder"
                  onClick={scrollToRecorder}
                  className="hover:text-gray-300 transition-colors"
                >
                  Record
                </a>
              </li>
              <li>
                <a
                  href="#recorder"
                  onClick={scrollToRecorder}
                  className="hover:text-gray-300 transition-colors"
                >
                  Upload
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-gray-300 transition-colors"
                >
                  About
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
                <a href="grant@purplemaia.org" className="hover:text-gray-300 hover:underline hover:underline-offset-4 transition-colors">
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
                <a
                  href="https://github.com/grxnto"
                  className="hover:text-gray-300 hover:underline hover:underline-offset-4 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Github
                </a>
              </p>
              <p>
                <a
                  href="https://purplemaia.org/"
                  className="hover:text-gray-300 hover:underline hover:underline-offset-4 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                > Purple Maiʻa
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
