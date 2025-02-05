import { React, useState } from 'react';
import { countries } from '../data/data';
import { FaUser } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAlert } from '../components/contexts/AlertContext';
import Alert from "../components/Alert";

const Register = () => {
    const navigate = useNavigate();
    const { alert, showAlert } = useAlert();
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        let formErrors = {};
        if (!formData.userName) formErrors.userName = "Username is required";
        if (!formData.email) formErrors.email = "Email is required";
        if (!formData.password) formErrors.password = "Password is required";
        if (!formData.confirmPassword)
            formErrors.confirmPassword = "Confirm password is required";
        if (formData.password !== formData.confirmPassword) {
            formErrors.confirmPassword = "Passwords do not match";
        }
        return formErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
                JSON.stringify(formData),
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 201) {
                navigate("/register-confirm");
            } else {
                showAlert(`Registration failed: ${response.status}`, "error");
            }
        } catch (error) {
            showAlert(error.message, "error");
            console.error("Registration failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Register Your Account - SimpleGeoAPI</title>
                <meta name="description" content="Sign up to create your account on SimpleGeoApi." />
                <meta name="keywords" content="register, sign up, create account, SimpleGeoApi" />
                <meta property="og:title" content="Register - SimpleGeoAPI" />
                <meta property="og:description" content="Sign up for an account on SimpleGeoApi" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://simplegeoapi.com/register" />
            </Helmet>
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                {/* Render alert component */}
                {alert && <Alert />}
                <div className="w-96 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
                    <h1 className="text-4xl text-center font-semibold text-gray-800 mb-6 flex justify-center items-center gap-2">
                        <FaUser className="text-indigo-600" />
                        Create an Account
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                name="userName"
                                placeholder="Enter Username..."
                                id="username"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                value={formData.userName}
                                onChange={handleChange}
                            />
                            {errors.userName && <p className="text-red-500 text-sm">{errors.userName}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Enter Email..."
                                id="email"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password..."
                                id="password"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password..."
                                id="confirmPassword"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-lg font-medium text-gray-700 mb-2">Location</label>
                            <select
                                name="location"
                                id="location"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                value={formData.location}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select your location</option>
                                {/* Assuming you have a list of countries */}
                                {countries.map((item, index) => (
                                    <option key={index} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating Account..." : "Create Account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
