import { React, useState } from 'react';
import axios from 'axios'

const FeedbackModal = ({ onClose, onSubmit }) => {

    const [feedback, setFeedback] = useState("");

    const handleSubmit = async () => {
        try {
            // Send feedback to the backend
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/feedback`, {
                feedback: feedback,
            });

            if (response.status === 201) {
                alert("Thank you for your feedback!");
                onSubmit(); // Close modal after submission
            }
        } catch (error) {
            alert("An error occurred while submitting feedback");
            console.error("Error submitting feedback:", error);
        }
    };
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-lg w-96 shadow-lg transform transition-all duration-300 scale-100 hover:scale-105">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">We value your feedback!</h2>
                <p className="text-lg text-gray-600 mb-6">Your experience is important to us. Please provide your feedback below.</p>
                <textarea
                    placeholder="Your feedback here..."
                    rows="5"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-700 resize-none mb-6"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Submit
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
