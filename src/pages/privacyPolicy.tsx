import React from "react";

export default function PrivacyPolicy() {
    return (
    <div className="m-2 p-4 privacy-page">
        <div className="header">
            <h1 className="text-center">Privacy Policy for Medicare App</h1>
            <p className="text-primary">Effective Date: June 16, 2025</p>
            <p className="text-neutral text-sm text-center">
                Welcome to MedicareApp. Your privacy is very important to us. This Privacy Policy explains how we collect, use, share, and protect your personal and health information when you use our medical app (“Service”).
            </p>
        </div>

        <section className="mb-6">
            <h2 className="text-primary">1. Information We Collect</h2>
            <h3 className="text-base mt-2">Personal Information</h3>
            <ul className="ml-4 text-neutral">
            <li>Name, email address, phone number, date of birth, and other identifiers you provide when creating an account.</li>
            <li>User credentials and authentication data.</li>
            </ul>
            <h3 className="text-base mt-2">Health Information</h3>
            <ul className="ml-4 text-neutral">
            <li>Medical records, medication details, appointment history, doctor notes, and other health-related data you enter or upload.</li>
            <li>Data from connected devices or integrations, if any.</li>
            </ul>
            <h3 className="text-base mt-2">Usage Data</h3>
            <ul className="ml-4 text-neutral">
            <li>How you interact with the app, including logs, device info, IP addresses, and usage patterns.</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">2. How We Use Your Information</h2>
            <ul className="ml-4 text-neutral">
            <li>Provide, maintain, and improve the app and its features.</li>
            <li>Facilitate appointment booking, medication management, reminders, and medical record access.</li>
            <li>Communicate important updates, reminders, and notifications.</li>
            <li>Comply with legal and regulatory requirements.</li>
            <li>Conduct research and analytics to enhance service quality (data anonymized).</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">3. How We Share Your Information</h2>
            <ul className="ml-4 text-neutral">
            <li>With healthcare providers involved in your care, as authorized by you.</li>
            <li>With third-party service providers who help operate the app (under strict confidentiality agreements).</li>
            <li>When required by law, legal process, or to protect rights and safety.</li>
            <li>We do <strong>not</strong> sell or rent your personal or health data to third parties.</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">4. Your Choices and Rights</h2>
            <ul className="ml-4 text-neutral">
            <li>You can access, update, or delete your personal information within the app.</li>
            <li>You can manage notification preferences or opt out of marketing communications.</li>
            <li>You have the right to request a copy of your health records we store.</li>
            <li>If you believe your data is incorrect or misused, contact our support for assistance.</li>
            <li>Depending on your location, you may have additional rights under applicable data protection laws (e.g., GDPR, CCPA).</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">5. Data Security</h2>
            <p className="text-neutral">
            We implement industry-standard security measures, including encryption, access controls, and regular audits to protect your information from unauthorized access, alteration, or disclosure.
            </p>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">6. Data Retention</h2>
            <p className="text-neutral">
            We retain your personal and health information only as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements.
            </p>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">7. Children’s Privacy</h2>
            <p className="text-neutral">
            Our Service is <strong className="font-bold">not intended for children under 13</strong>. We do not knowingly collect personal information from children under 13. If we become aware of such data, we will delete it promptly.
            </p>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">8. Changes to This Privacy Policy</h2>
            <p className="text-neutral">
            We may update this policy occasionally. When we do, we will revise the effective date and notify you through the app or email. Please review periodically.
            </p>
        </section>

        <section className="mb-6">
            <h2 className="text-primary">9. Contact Us</h2>
            <p className="text-gray-700">
            If you have questions or concerns about this Privacy Policy or your data, please contact us:
            </p>
            <ul className="ml-4 text-neutral">
            <li>Email: <a href="mailto:privacy@medicareapp.com" className="text-primary">privacy@medicareapp.com</a></li>
            <li>Phone: <a href="/" className="text-primary"> 1-800-MEDICARE</a></li>
            <li>Address: <span className="text-primary">MedicareApp Support, 123 Health St, MedCity, USA</span></li>
            </ul>
        </section>

        <p className="mt-6 text-center font-medium">
            By using MedicareApp, you agree to the terms of this Privacy Policy.
        </p>
        </div>
    );
}
