import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate()
    return (
        <div className="bg-gray-50 text-gray-800">
            {/* SEO Optimization */}
            <Helmet>
                {/* Primary Meta Tags */}
                <title>GeoCode API - Fast & Accurate Geolocation Services</title>
                <meta name="description" content="GeoCode API provides precise geolocation and address lookup services for developers and businesses. Try it for free!" />
                <meta name="keywords" content="geocode, geolocation, API, mapping, address lookup, location services" />
                <meta name="author" content="GeoCode API Team" />
                <meta name="robots" content="index, follow" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="GeoCode API - Fast & Accurate Geolocation Services" />
                <meta property="og:description" content="GeoCode API provides precise geolocation and address lookup services for developers and businesses. Try it for free!" />
                <meta property="og:image" content="https://simplegeoapi.com/og-image.jpg" />
                <meta property="og:url" content="https://simplegeoapi.com" />

                {/* Twitter Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="GeoCode API - Fast & Accurate Geolocation Services" />
                <meta name="twitter:description" content="GeoCode API provides precise geolocation and address lookup services for developers and businesses. Try it for free!" />
                <meta name="twitter:image" content="https://simplegeoapi.com/og-image.jpg" />

                {/* Canonical Tag (Prevents Duplicate Content Issues) */}
                <link rel="canonical" href="https://simplegeoapi.com" />
            </Helmet>
            {/* Hero Section */}
            <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 my-10 md:my-0">
                        <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                            Geocode Made Simple
                        </h1>
                        <p className="text-lg lg:text-xl mb-6">
                            Unlock precise geolocation data for your applications. Whether
                            you're mapping, analyzing, or integrating, our Geocoding API has
                            you covered.
                        </p>
                        <button className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100"
                            onClick={() => { navigate("/register") }}>
                            Get Started for Free
                        </button>
                    </div>
                    <div className="relative md:w-1/2 w-full transform md:translate-x-8 p-2">
                        {/* Background Overlay */}
                        <div className="absolute inset-0 rounded-lg"></div>
                        {/* Responsive Hero Image */}
                        <img
                            src="https://media.istockphoto.com/id/1781263370/vector/track-navigation-pins-on-isometric-street-maps-navigate-mapping-technology-locate-position.jpg?s=612x612&w=0&k=20&c=1mhXOIbT52wY1rOaXLNQawEgicTPRcQjq_s06ePTNiA="
                            alt="Geocode API"
                            className="rounded-lg shadow-lg object-cover w-full h-64 md:h-full lg:h-[400px]"
                            loading="lazy"
                        />
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-6">Features</h2>
                    <p className="text-center text-gray-600 mb-12">
                        Everything you need for accurate and fast geolocation data.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Accurate Geocoding",
                                description:
                                    "Convert addresses into exact latitude and longitude coordinates with high precision.",
                                icon: "map-pin",
                            },
                            {
                                title: "Batch Processing",
                                description:
                                    "Submit multiple addresses at once for bulk geocoding.",
                                icon: "layers",
                            },
                            {
                                title: "Reverse Geocoding",
                                description:
                                    "Turn coordinates into meaningful addresses instantly.",
                                icon: "map",
                            },
                            {
                                title: "Scalable API",
                                description:
                                    "Supports millions of requests with low latency and high availability.",
                                icon: "server",
                            },
                            {
                                title: "Flexible Pricing",
                                description:
                                    "Choose from free, pro, premium, and enterprise plans to suit your needs.",
                                icon: "dollar-sign",
                            },
                            {
                                title: "Developer-Friendly",
                                description:
                                    "Clear documentation, SDKs, and tools to get started quickly.",
                                icon: "code",
                            },
                        ].map((feature, index) => (
                            <div key={index} className="p-6 bg-white rounded-lg shadow-md">
                                <div className="flex items-center justify-center h-12 w-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d={feature.icon === "map-pin" ? "M12 2C8.686 2 6 4.686 6 8c0 2.716 1.5 5.122 3.693 6.347L12 20l2.307-5.653C16.5 13.122 18 10.716 18 8c0-3.314-2.686-6-6-6z" : feature.icon === "layers" ? "M4 8l8-4 8 4m-8 4l8-4m-8 4l-8-4m8 4v8" : feature.icon === "map" ? "M3 7l8.5-3 8.5 3-8.5 4L3 7zm0 10l8.5 4 8.5-4-8.5-4L3 17z" : feature.icon === "server" ? "M4 4h16M4 12h16M4 20h16" : feature.icon === "dollar-sign" ? "M12 1v22m-7-11h14" : "M9 12h6M12 9v6"}
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-gray-100 py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-6">Pricing Plans</h2>
                    <p className="text-center text-gray-600 mb-12">
                        Choose the plan that fits your needs.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "Free", price: "£0", features: ["1,000 requests/month", "Standard response time", "Community support"] },
                            { name: "Pro", price: "£19.99", features: ["50,000 requests/month", "Faster response time", "Email support"] },
                            { name: "Premium", price: "£69.99", features: ["250,000 requests/month", "Priority support", "Advanced analytics"] },
                        ].map((plan, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="mt-2 text-4xl font-bold">{plan.price}</p>
                                <ul className="mt-4 space-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="text-gray-600">
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                                    Choose Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to start building with our Geocoding API?
                    </h2>
                    <button className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100"
                        onClick={() => { navigate("/register") }}>
                        Get Started Now
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
