import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth()
    const tabs = ["Home", "Pricing", "Documentation", "Contact"]
    const navigate = useNavigate()

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/login")
        } catch (error) {
            console.error('Error: ', error)
        }
    }

    return (
        <nav className="bg-white shadow-md relative">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <a href="/home" className="text-2xl font-bold text-blue-600">
                    SimpleGeoAPI
                </a>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                    {!user ? (
                        <>
                            {tabs.map((link, index) => (
                                <a
                                    key={index}
                                    href={`/${link.toLowerCase()}`}
                                    className="text-gray-600 hover:text-blue-600"
                                >
                                    {link}
                                </a>
                            ))}
                            {/* Login Button */}
                            <a
                                href="/login"
                                className="ml-6 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Sign in
                            </a>
                        </>
                    ) : (
                        <>
                            {["Profile", "Documentation", "Contact"].map((link, index) => (
                                <a
                                    key={index}
                                    href={`/${link.toLowerCase()}`}
                                    className="text-gray-600 hover:text-blue-600"
                                >
                                    {link}
                                </a>
                            ))}
                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="ml-6 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Icon */}
                <div className="md:hidden z-20">
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
            </div>

            {/* Dropdown Menu (Move Outside the Centered Wrapper) */}
            {isMenuOpen && (
                <>
                    {/* Dropdown Menu Positioned Under Navbar */}
                    <div className="md:hidden absolute left-0 top-full w-full bg-white text-black z-50 shadow-md border-t transition-all duration-300 ease-in-out">
                        <ul className="space-y-2 p-6">
                            {!user ? (
                                <>
                                    {tabs.map((link, index) => (
                                        <li key={index} className="flex items-center w-full text-left">
                                            <a
                                                href={`/${link.toLowerCase()}`}
                                                className="text-gray-600 hover:text-blue-600 block w-full px-4 py-2"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}

                                    {/* Sign In Link */}
                                    <li className="mt-2">
                                        <a
                                            href="/login"
                                            className="w-full block text-center text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                                        >
                                            Sign In
                                        </a>
                                    </li>
                                </>
                            ) : (
                                <>
                                    {["Profile", "Documentation", "Contact"].map((link, index) => (
                                        <li key={index} className="flex items-center w-full text-left">
                                            <a
                                                href={`/${link.toLowerCase()}`}
                                                className="text-gray-600 hover:text-blue-600 block w-full px-4 py-2"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}

                                    {/* Logout Button */}
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full block text-center text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;
