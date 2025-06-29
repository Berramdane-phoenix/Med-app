import React from 'react';

export default function CookiePolicy() {
    return (
        <main className='m-2 p-4 cookies-page text-neutral'>
        <div className="header">
            <h1>Cookie Policy</h1>
            <p className='text-primary'>Last updated: June 2025</p>
        </div>

        <section>
            <h2 className='text-primary'>What Are Cookies?</h2>
            <p>
            Cookies are small text files stored on your device by your web browser. They help us enhance your experience by remembering preferences and improving functionality.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>How We Use Cookies</h2>
            <p>
            We use cookies to:
            </p>
            <ul className='ml-2 '>
            <li>Enable core functionality such as authentication and security</li>
            <li>Remember your preferences and settings</li>
            <li>Analyze usage to improve our Service</li>
            </ul>
        </section>

        <section>
            <h2 className='text-primary'>Types of Cookies We Use</h2>
            <ul className='ml-2'>
            <li><strong>Essential Cookies:</strong> Required for basic site operations.</li>
            <li><strong>Performance Cookies:</strong> Collect anonymous usage data to help us improve.</li>
            <li><strong>Functional Cookies:</strong> Remember your choices and preferences.</li>
            </ul>
        </section>

        <section>
            <h2 className='text-primary'>Your Choices Regarding Cookies</h2>
            <p>
            You can manage or disable cookies through your browser settings. However, disabling certain cookies may affect how the Service functions.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>Changes to This Cookie Policy</h2>
            <p>
            We may update this policy periodically. We encourage you to review this page regularly.
            </p>
        </section>

        <section>
            <h2 className='text-primary'>Contact Us</h2>
            <p>
            If you have any questions about our Cookie Policy, please contact us at <a href="mailto:support@medicareapp.com" className="text-primary">support@medicareapp.com</a>.
            </p>
        </section>
        </main>
    );
}
