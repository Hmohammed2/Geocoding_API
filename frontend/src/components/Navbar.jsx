import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const tabs = ["Home", "Pricing", "Documentation", "Contact"];
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    return (
        <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <a href="/home" className="text-2xl font-extrabold text-white tracking-wide">
                    SimpleGeoAPI
                </a>

                {/* Navigation Links (Desktop) */}
                <div className="hidden md:flex items-center space-x-6">
                    {!user ? (
                        <>
                            {tabs.map((link, index) => (
                                <a
                                    key={index}
                                    href={`/${link.toLowerCase()}`}
                                    className="text-gray-200 hover:text-white transition duration-300"
                                >
                                    {link}
                                </a>
                            ))}
                            {/* Login Button */}
                            <a
                                href="/login"
                                className="ml-6 px-5 py-2 bg-white text-blue-700 rounded-lg shadow-md hover:bg-gray-200 transition-all"
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
                                    className="text-gray-200 hover:text-white transition duration-300"
                                >
                                    {link}
                                </a>
                            ))}
                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="ml-6 px-5 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Icon */}
                <div className="md:hidden z-50">
                    <button className="text-white text-2xl" onClick={toggleMenu}>
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`fixed top-0 left-0 w-full h-screen bg-black bg-opacity-60 transition-transform duration-500 ${
                    isMenuOpen ? "translate-x-0" : "-translate-x-full"
                } md:hidden z-50`}
            >
                <div className="bg-white w-3/4 h-full shadow-lg p-6 flex flex-col">
                    {/* Close Button */}
                    <button onClick={toggleMenu} className="self-end text-gray-600 text-2xl">
                        <FaTimes />
                    </button>

                    {/* Links */}
                    <ul className="mt-6 space-y-4">
                        {!user ? (
                            <>
                                {tabs.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={`/${link.toLowerCase()}`}
                                            className="block text-gray-700 text-lg hover:text-blue-600 transition-all"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                                {/* Sign In Link */}
                                <li>
                                    <a
                                        href="/login"
                                        className="block w-full text-center text-white bg-blue-600 px-5 py-2 rounded-md hover:bg-blue-700 transition-all"
                                    >
                                        Sign In
                                    </a>
                                </li>
                            </>
                        ) : (
                            <>
                                {["Profile", "Documentation", "Contact"].map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={`/${link.toLowerCase()}`}
                                            className="block text-gray-700 text-lg hover:text-blue-600 transition-all"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                                {/* Logout Button */}
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full block text-center text-white bg-red-600 px-5 py-2 rounded-md hover:bg-red-700 transition-all"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
