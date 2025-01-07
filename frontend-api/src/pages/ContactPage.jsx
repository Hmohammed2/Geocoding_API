import React from "react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 mb-12">
          We’d love to hear from you! Reach out to us via email or phone, or use the form below.
        </p>
        <div className="flex flex-col lg:flex-row justify-between items-start mb-12 space-y-6 lg:space-y-0 lg:space-x-12">
          {/* Contact Info */}
          <div className="w-full lg:w-1/3 bg-blue-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Details
            </h2>
            <p className="text-gray-600 mb-2">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:harambee_developers@hotmail.com"
                className="text-blue-600 hover:underline break-all"
              >
                harambee_developers@hotmail.com
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
          <div className="w-full lg:w-2/3">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your message here"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm">
          We’ll get back to you as soon as possible!
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
