import React from 'react';
import { Helmet } from "react-helmet-async";

const TermsAndServices = () => {
    return (
        <>
            <Helmet>
                <title>Terms and Conditions | SimpleGeoAPI</title>
                <meta 
                    name="description"
                    content="Read the terms and conditions of using the SimpleGeoAPI service. Understand the license, restrictions, fees, and other important information."
                />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://simplegeoapi.com/terms" />
            </Helmet>

            <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-6">
                    Terms and Services <span className="text-sm text-gray-500">Version 1.0</span>
                </h1>
                
                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="introduction">1. Introduction</h2>
                    <p className="text-gray-600">
                        Welcome to SimpleGeoAPI. These Terms and Services ("Terms") govern your access to and use of the SimpleGeoAPI ("API"), developed and owned by Hamza Mohammed ("Licensor"). By accessing or using the API, you ("Licensee") agree to comply with these Terms. If you do not agree, do not use the API.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="license">2. Grant of License</h2>
                    
                    <h3 className="text-xl font-medium text-gray-700 mt-4">2.1 License Grant</h3>
                    <p className="text-gray-600">
                        Licensor grants Licensee a limited, non-exclusive, non-transferable, and revocable license to use the API in accordance with these Terms.
                    </p>
                    
                    <h3 className="text-xl font-medium text-gray-700 mt-4">2.2 Usage Tiers</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li><span className="font-semibold">Free Tier:</span> Licensee may use the API for non-commercial purposes, subject to limitations on API usage, such as request limits or feature access, as specified in the API documentation.</li>
                        <li><span className="font-semibold">Commercial Use:</span> Licensee must purchase a commercial license or subscription plan to use the API for any commercial or revenue-generating purposes.</li>
                    </ul>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="restrictions">3. Restrictions</h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Licensee shall not use the API for illegal, fraudulent, or harmful activities.</li>
                        <li>Licensee shall not distribute, sublicense, or sell access to the API without explicit written consent from the Licensor.</li>
                        <li>Licensee shall not modify, reverse engineer, or create derivative works of the API.</li>
                        <li>Licensee shall not exceed the usage limits specified for the chosen plan or tier.</li>
                    </ul>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="ownership">4. Ownership</h2>
                    <p className="text-gray-600">
                        All rights, title, and interest in and to the API, including any updates, modifications, or enhancements, remain with the Licensor. These Terms do not transfer any ownership rights to the Licensee.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="fees">5. Fees and Payments</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-medium text-gray-700">5.1 Free Tier</h3>
                            <p className="text-gray-600">
                                Access to basic API features and limited usage is provided without charge.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-gray-700">5.2 Paid Plans</h3>
                            <p className="text-gray-600">
                                Commercial use or access to advanced features requires a subscription or one-time payment as outlined in the API documentation or pricing page.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-gray-700">5.3 Non-Payment</h3>
                            <p className="text-gray-600">
                                Failure to pay required fees will result in suspension or termination of access to the API.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="termination">6. Termination</h2>
                    <p className="text-gray-600">
                        Licensor reserves the right to terminate these Terms and Licensee's access to the API if Licensee breaches any terms of this agreement. Upon termination, Licensee must immediately cease all use of the API.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="disclaimer">7. Disclaimer of Warranties</h2>
                    <p className="text-gray-600">
                        The API is provided "as is" without warranty of any kind, express or implied. Licensor does not guarantee uninterrupted access, accuracy, or fitness for a particular purpose.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="limitation">8. Limitation of Liability</h2>
                    <p className="text-gray-600">
                        Licensor shall not be liable for any damages, including direct, indirect, incidental, or consequential damages, arising from the use of the API.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="governing-law">9. Governing Law</h2>
                    <p className="text-gray-600">
                        These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction in which Licensor operates.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2" id="contact">10. Contact Information</h2>
                    <p className="text-gray-600">
                        For questions or requests related to these Terms, please contact:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2">
                        <li><span className="font-semibold">Email:</span> harambee_developers@hotmail.com</li>
                        <li><span className="font-semibold">Phone:</span> +44 790 821 3588</li>
                    </ul>
                </section>

                <p className="mt-6 text-gray-600 font-medium">
                    By using the API, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                </p>
            </div>
        </>
    );
};

export default TermsAndServices;
