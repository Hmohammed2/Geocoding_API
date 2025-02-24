import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/send-email`, formData);

      if (response.status === 200) {
        setStatus("✅ Message sent successfully!");
        setFormData({ name: "", email: "", message: "" }); // Reset form
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("❌ Failed to send message. Try again later.");
    }
  };
  return (
    <>
      <Helmet>
        <title>Contact Us - SimpleGeoAPI</title>
        <meta
          name="description"
          content="Get in touch with us at SimpleGeoAPI. Reach out via email or phone, or use the form to send us a message. We're here to help you!"
        />
        <meta
          name="keywords"
          content="contact us, geolocation support, contact SimpleGeoAPI, support form, customer service"
        />
        <meta property="og:title" content="Contact Us - SimpleGeoAPI" />
        <meta
          property="og:description"
          content="Get in touch with us at SimpleGeoAPI. Reach out via email or phone, or use the form to send us a message. We're here to help you!"
        />
        <meta
          property="og:image"
          content="https://yourwebsite.com/assets/contact-us-og-image.jpg"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yourwebsite.com/contact" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl max-w-5xl md:w-full w-96  p-10 md:p-16 space-y-8 transform transition-all duration-300 hover:scale-105">
          <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className="text-center text-gray-700 text-lg mb-8">
            We’d love to hear from you! Reach out to us via email or phone, or use the form below.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Contact Info */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Contact Details
              </h2>
              <p className="text-gray-600 mb-3">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info@simplegeoapi.com"
                  className="text-blue-600 hover:underline"
                >
                  info@simplegeoapi.com
                </a>
              </p>
              <p className="text-gray-600">
                <strong>Phone:</strong>{" "}
                <a
                  href="tel:+447908213588"
                  className="text-blue-600 hover:underline"
                >
                  +44 7908 213588
                </a>
              </p>
            </div>
            {/* Contact Form */}
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-xl shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-3 px-5 transition duration-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-xl shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-3 px-5 transition duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full border-gray-300 rounded-xl shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-3 px-5 transition duration-300"
                    placeholder="Write your message here"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 focus:ring-2 focus:ring-indigo-500"
                >
                  Send Message
                </button>
                {status && <p className="text-center mt-4">{status}</p>}
              </form>
            </div>
          </div>
          {/* Footer Note */}
          <p className="text-center text-gray-500 text-sm">
            We’ll get back to you as soon as possible!
          </p>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
