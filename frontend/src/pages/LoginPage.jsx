import { React, useState } from 'react'
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../components/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/contexts/AlertContext';
import Alert from "../components/Alert";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { alert, showAlert } = useAlert()

    const handleLogin = async () => {
        try {
            await login(email, password);
            navigate('/login-confirm')
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
            <div className="flex items-center justify-center h-screen border">
                {/* Render alert component */}
                {alert && <Alert />}
                <div className="w-96 p-6 shadow-lg bg-white rounded-md">
                    <h1 className="text-3xl flex justify-center text-center font-semibold gap-2 mb-4">
                        <FaUser />
                        Login
                    </h1>
                    <div className="mt-3">
                        <label htmlFor="email" className="block text-base mb-2 font-semibold">
                            {" "}
                            Email Address
                        </label>
                        <input
                            type="text"
                            name="email"
                            placeholder="Enter Email..."
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            id="email"
                            className="border focus:border-2 w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-600 rounded-md"
                            required
                        />
                    </div>
                    <div className="mt-3">
                        <label htmlFor="password" className="block text-base mb-2 font-semibold">
                            {" "}
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password..."
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            id="password"
                            className="border w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-600 focus:border-2 rounded-md"
                            required
                        />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <div>
                            <a
                                href="/"
                                className="text-blue-600 hover:text-blue-300 text-sm"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    <div className="mt-5">
                        <button
                            onClick={handleLogin}
                            className="border bg-white text-blue-600 font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100 w-full"
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

export default LoginPage