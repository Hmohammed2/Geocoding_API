import { React, useState } from 'react'
import { countries } from '../data/data';
import { FaUser } from "react-icons/fa";
import axios from "axios";

const Register = () => {

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: ""
    });


    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Validate the form and set errors if any
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        // Reset errors and mark as submitting
        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
                JSON.stringify(formData),
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Response data:", response.data); // Debugging line

            if (response.status !== 201) {
                alert(`Registration failed: ${response.status}`);
            } else {
                alert("Registration successful!");
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmitting(false); // Ensure `isSubmitting` is reset regardless of success or error
        }
    };

    // Helper function to handle errors
    const handleError = (error) => {
        if (error.response) {
            const { code, message } = error.response.data;

            // Handle duplicate key error
            if (code === 11000) {
                alert(message || "User already exists.");
            } else {
                alert(`Error: ${message || "An error occurred. Please try again later."}`);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error("No response received:", error.request);
            alert("No response from server. Please check your connection.");
        } else {
            // Unexpected error
            console.error("Unexpected error:", error.message);
            alert("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen border">
            <div className="w-96 p-6 shadow-lg bg-white rounded-md">
                <h1 className="text-3xl flex justify-center text-center font-semibold gap-2 mb-4">
                    <FaUser />
                    Create an Account
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mt-3">
                        <label htmlFor="username" className="block text-base mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="userName"
                            placeholder="Enter Username..."
                            id="username"
                            className="border w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-500 focus:border-2 rounded-md"
                            value={formData.userName}
                            onChange={handleChange}
                        />
                        {errors.userName && (
                            <p className="text-red-500 text-sm">{errors.userName}</p>
                        )}
                    </div>
                    <div className="mt-3">
                        <label htmlFor="email" className="block text-base mb-2">
                            Email Address
                        </label>
                        <input
                            type="text"
                            name="email"
                            placeholder="Enter email address..."
                            id="email"
                            className="border w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-500 focus:border-2 rounded-md"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">{errors.email}</p>
                        )}
                    </div>
                    <div className="mt-3">
                        <label htmlFor="password" className="block text-base mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password..."
                            id="password"
                            className="border w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-500 focus:border-2 rounded-md"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password}</p>
                        )}
                    </div>
                    <div className="mt-3">
                        <label htmlFor="confirmPassword" className="block text-base mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password..."
                            id="confirmPassword"
                            className="border w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-500 focus:border-2 rounded-md"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                        )}
                    </div>
                    <div className="mt-3">
                        <label htmlFor="location" className="block text-base mb-2 mt-2">
                            Location
                        </label>
                        <select
                            name="location"
                            className="border w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-500 focus:border-2 py-2 rounded-md"
                            id="location"
                            value={formData.location}
                            onChange={handleChange}
                        >
                            <option value="default" disabled>Select location</option>
                            {countries.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-5">
                        <button
                            className={`border ${isSubmitting ? "bg-gray-500" : "bg-white"
                                } text-blue-600 font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100 w-full`}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register