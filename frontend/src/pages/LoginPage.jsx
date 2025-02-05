import { React, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../components/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/contexts/AlertContext';
import Alert from "../components/Alert";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { alert, showAlert } = useAlert();

    const handleLogin = async () => {
        try {
            await login(email, password);
            navigate('/login-confirm');
        } catch (error) {
            showAlert(error.message, "error");
            console.error("Login failed:", error);
        }
    };

    return (
        <>
            <Helmet>
                <title>Login to Your Account - SimpleGeoAPI</title>
                <meta name="description" content="Login to your account on SimpleGeoApi. Enter your credentials to access your account and manage your settings." />
                <meta name="keywords" content="login, sign in, user authentication, secure login, SimpleGeoApi" />
                <meta property="og:title" content="Login to Your Account - SimpleGeoApi" />
                <meta property="og:description" content="Login to your account on SimpleGeoApi to access all the features and manage your account settings." />
                <meta property="og:image" content="URL_to_image" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://simplegeoapi.com/login" />
            </Helmet>
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                {/* Render alert component */}
                {alert && <Alert />}
                <div className="w-96 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
                    <h1 className="text-4xl text-center font-semibold text-gray-800 mb-6 flex justify-center items-center gap-2">
                        <FaUser className="text-indigo-600" />
                        Login
                    </h1>
                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Enter Email..."
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                id="email"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password..."
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                id="password"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <div>
                            <a
                                href="/"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={handleLogin}
                            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
