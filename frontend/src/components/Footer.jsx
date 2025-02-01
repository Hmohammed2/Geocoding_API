const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Flex Container */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Logo */}
            <div className="text-center md:text-left">
              <a href="#" className="text-2xl font-bold text-blue-500">
                SimpleGeoAPI
              </a>
            </div>
  
            {/* Footer Links */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 text-center">
              <a href="#privacy" className="hover:text-blue-500">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-blue-500">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-blue-500">
                Contact
              </a>
            </div>
  
            {/* Social Media Links */}
            <div className="flex justify-center space-x-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 4.01c-0.79 0.35-1.64 0.58-2.54 0.68 0.92-0.55 1.62-1.43 1.95-2.47-0.86 0.51-1.81 0.89-2.82 1.09-0.81-0.87-1.96-1.42-3.24-1.42-2.45 0-4.44 1.99-4.44 4.44 0 0.35 0.04 0.7 0.12 1.03-3.69-0.19-6.96-1.95-9.14-4.64-0.38 0.65-0.6 1.41-0.6 2.22 0 1.54 0.78 2.9 1.97 3.7-0.73-0.02-1.42-0.22-2.02-0.55v0.06c0 2.14 1.53 3.94 3.56 4.35-0.37 0.1-0.75 0.15-1.14 0.15-0.28 0-0.56-0.03-0.83-0.08 0.57 1.79 2.24 3.1 4.21 3.14-1.54 1.21-3.48 1.94-5.59 1.94-0.36 0-0.73-0.02-1.09-0.06 1.99 1.28 4.37 2.02 6.92 2.02 8.3 0 12.86-6.88 12.86-12.86 0-0.2-0.01-0.4-0.03-0.6 0.88-0.64 1.65-1.44 2.25-2.35z"
                  />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h8V14h-3v-4h3V8c0-3.31 2.69-5 5-5 1.38 0 2.67.5 3.6 1.34V7h-2c-1.1 0-2 .9-2 2v3h4l-1 4h-3v8h5c1.1 0 1.99-.9 1.99-2L22 4c0-1.1-.89-2-1.99-2z"
                  />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 8c1.104 0 2 0.896 2 2s-0.896 2-2 2-2-0.896-2-2 0.896-2 2-2zM4 4h2v16H4zm8 0h2v16h-2z"
                  />
                </svg>
              </a>
            </div>
          </div>
  
          {/* Bottom Section */}
          <div className="mt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SimpleGeoAPI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  