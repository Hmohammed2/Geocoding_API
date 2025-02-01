import { React, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../components/contexts/AuthContext";

const Subscription = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const handlePayment = async (subscriptionType) => {
        if (!user) { navigate("/register") }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-checkout-session/`,
                { userId: user.userId, subscriptionType }
            );

            console.log("Response data:", response.data); // Debugging line
            if (response.data.url) {
                window.location.href = response.data.url; // Redirect to Stripe checkout
            } else {
                console.log("No URL returned from server");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
        }
    };

    const plans = [
        {
            name: "Free",
            description: "Perfect for testing and small-scale projects.",
            price: 0,
            features: [
                "Up to 1,000 requests/month",
                "Standard API response time",
                "Community support",
            ],
            bgColor: "bg-gray-800",
            hoverColor: "hover:bg-gray-700",
            textColor: "text-white",
            border: "",
            actionText: "Get Started",
            subscriptionType: "free",
        },
        {
            name: "Pro",
            description: "Ideal for startups and small businesses.",
            price: 19.99,
            features: [
                "Up to 50,000 requests/month",
                "Faster API response time",
                "Email support",
                "Access to Batch Geocoding",
                "Basic Analytics on usage",
            ],
            bgColor: "bg-purple-500",
            hoverColor: "hover:bg-purple-600",
            textColor: "text-white",
            border: "border-2 border-purple-500",
            actionText: "Go Pro",
            subscriptionType: "pro",
        },
        {
            name: "Premium",
            description: "Great for scaling businesses and applications.",
            price: 69.99,
            features: [
                "Up to 250,000 requests/month",
                "Priority API response time",
                "24/7 email support",
                "Access to advanced geocoding features",
                "Customizable geocoding data sources",
                "Advanced location-based analytics",
            ],
            bgColor: "bg-blue-500",
            hoverColor: "hover:bg-blue-600",
            textColor: "text-white",
            border: "border-2 border-blue-500",
            actionText: "Upgrade Now",
            subscriptionType: "premium",
        },
    ];

    const benefitList = [
        "Requests/month",
        "API response time",
        "Support type",
        "Advanced geocoding features",
        "Batch Geocoding",
        "Advanced Analytics",
        "Custom Data Sources",
    ];

    const benefitsData = {
        "Free": [
            "1,000",
            "Standard",
            "Community",
            "No",
            "No",
            "No",
            "No",
            "No"
        ],
        "Pro": [
            "50,000",
            "Faster",
            "Email",
            "Yes",
            "Yes",  // Access to batch geocoding
            "No",   // No advanced analytics
            "No",   // No customizable data sources
        ],
        "Premium": [
            "250,000",
            "Priority",
            "24/7 Email",
            "Yes",  // Access to advanced geocoding features
            "Yes",  // Access to batch geocoding
            "Yes",  // Access to advanced analytics
            "Yes",  // Customizable data sources
        ]
    };

    const faqs = [
        {
            question: "Can I change my plan later?",
            answer:
                "Yes, you can upgrade or downgrade your plan at any time from your account settings.",
        },
        {
            question: "What happens if I exceed my request limit?",
            answer:
                "If you exceed your request limit, your access will be temporarily paused until the next billing cycle or until you upgrade your plan.",
        },
        {
            question: "Are there any hidden fees?",
            answer: "No, all fees are transparent and listed in the subscription pricing.",
        },
        {
            question: "Do you offer refunds?",
            answer:
                "We offer a 30-day money-back guarantee for first-time subscribers of the Pro and Premium plans.",
        },
        {
            question: "How is support provided?",
            answer:
                "Support is provided based on your plan. Free users have access to community support, while Pro and Premium users have email support with faster response times.",
        },
    ];

    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (<>
        {/* SEO Optimization */}
        <Helmet>
            <title>Subscription Plans - GeoCode API</title>
            <meta name="description" content="Choose the right plan for your needs. Free, Pro, and Premium options available with advanced geolocation features." />
            <meta name="keywords" content="geocode, API, subscription, pricing, location services" />
            <meta property="og:title" content="GeoCode API Subscription Plans" />
            <meta property="og:description" content="Flexible subscription plans to meet your geolocation needs." />
            <meta property="og:image" content="https://simplegeoapi.com/og-image.jpg" />
            <meta property="og:url" content="https://simplegeoapi.com/pricing" />
            <link rel="canonical" href="https://simplegeoapi.com/pricing" />
        </Helmet>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            <h1 className="text-gray-800 text-3xl py-10 font-bold">SimpleGeoAPI plans and pricing</h1>
            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mb-10">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`bg-white rounded-lg shadow-lg p-6 ${plan.border}`}
                    >
                        <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                        <p className="mt-2 text-gray-600">{plan.description}</p>
                        <div className="mt-4">
                            <p className="text-4xl font-bold text-gray-800">
                                {plan.price === "Contact Us" ? plan.price : `£${plan.price}`}
                            </p>
                            {plan.price !== "Contact Us" && (
                                <p className="text-sm text-gray-500">per month</p>
                            )}
                        </div>
                        <ul className="mt-4 space-y-2">
                            {plan.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center">
                                    <svg
                                        className="h-5 w-5 text-green-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span className="ml-2 text-gray-600">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            className={`mt-6 w-full ${plan.bgColor} ${plan.textColor} py-2 px-4 rounded ${plan.hoverColor}`}
                            onClick={() =>
                                plan.subscriptionType === "free"
                                    ? navigate("/register")
                                    : handlePayment(plan.subscriptionType)
                            }
                        >
                            {plan.actionText}
                        </button>
                    </div>
                ))}
            </div>

            {/* Comparison Table */}
            <h1 className="text-gray-800 text-2xl py-10 font-bold">Plan Comparison</h1>
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg w-full max-w-7xl">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border border-gray-300 bg-gray-100">Benefit</th>
                            {Object.keys(benefitsData).map((plan, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-2 border border-gray-300 bg-gray-100"
                                >
                                    {plan}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {benefitList.map((benefit, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 border border-gray-300">{benefit}</td>
                                {Object.keys(benefitsData).map((plan, planIndex) => (
                                    <td
                                        key={planIndex}
                                        className="px-4 py-2 border border-gray-300 text-center"
                                    >
                                        {benefitsData[plan][index]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* FAQ Section */}
            <h2 className="text-2xl font-bold text-gray-800 py-10">Frequently Asked Questions</h2>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl w-full">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-300 pb-4">
                            <button
                                className="flex justify-between items-center w-full text-left focus:outline-none"
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3 className="text-lg font-semibold text-gray-700">
                                    {faq.question}
                                </h3>
                                <span className="text-gray-600">
                                    {openFAQ === index ? "-" : "+"}
                                </span>
                            </button>
                            {openFAQ === index && (
                                <p className="text-gray-600 mt-2">{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
    );
};

export default Subscription;
