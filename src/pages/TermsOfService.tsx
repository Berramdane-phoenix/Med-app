import React from 'react';

export default function TermsOfService() {
    return (
        <main className='m-2 p-4 service-page text-neutral'>
        <div className="header">
            <h1 className=''>Terms of Service</h1>
            <span className='text-primary'>Last updated: June 2025</span>
        </div>
        <section>
            <h2 className='text-primary'>1. Acceptance of Terms</h2>
            <p>
            By accessing or using the MediCare application (“Service”), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, please do not use our Service.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>2. Use of Service</h2>
            <p>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not use the Service to engage in any activity that could harm, disrupt, or interfere with others’ use of the Service.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>3. User Accounts</h2>
            <p>
            To access certain features, you may be required to create an account and provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>4. Privacy</h2>
            <p>
            Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-indigo-600 underline">Privacy Policy</a> to understand how we collect, use, and protect your personal information.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>5. Intellectual Property</h2>
            <p>
            All content, trademarks, and data on the Service are the property of MediCare or its licensors and are protected by intellectual property laws. You agree not to copy, distribute, or create derivative works without permission.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>6. Limitation of Liability</h2>
            <p>
            The Service is provided "as is" without warranties of any kind. MediCare is not liable for any damages arising from the use or inability to use the Service.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>7. Termination</h2>
            <p>
            We reserve the right to suspend or terminate your access to the Service for violations of these Terms or other reasons.
            </p>
        </section>

        <section>
            <h2 className='text-primary' >8. Changes to Terms</h2>
            <p>
            We may update these Terms occasionally. Continued use of the Service after changes means you accept the new Terms.
            </p>
        </section>

        <section >
            <h2 className='text-primary'>9. Contact Us</h2>
            <p>
            If you have questions about these Terms, please contact us at <a href="mailto:support@medicareapp.com" className="text-primary">support@medicareapp.com</a>.
            </p>
        </section>
        </main>
    );
}
