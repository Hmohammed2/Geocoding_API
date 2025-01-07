import React, { useState } from 'react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev)
    }

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <a href="/home" className="text-2xl font-bold text-blue-600">
                    SimpleGeoAPI
                </a>
                {/* Navigation Links */}
                <div className="hidden md:flex space-x-6">
                    {["Home", "Pricing", "Documentation", "Contact", "Login", "Register"].map(
                        (link, index) => (
                            <a
                                key={index}
                                href={`/${link.toLowerCase()}`}
                                className="text-gray-600 hover:text-blue-600"
                            >
                                {link}
                            </a>
                        )
                    )}
                </div>
                {/* Mobile Menu Icon (for small screens) */}
                <div className="md:hidden">
                    <button className="text-gray-600 hover:text-blue-600" onClick={toggleMenu}>
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
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </button>
                </div>
                {/* Dropdown Menu (for small screens) */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t shadow-md">
                        <ul className="space-y-2 py-4 px-6">
                            {["Home", "Features", "Pricing", "Documentation", "Contact"].map(
                                (link, index) => (
                                    <li key={index}>
                                        <a
                                            href={`/${link.toLowerCase()}`}
                                            className="block text-gray-600 hover:text-blue-600"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
