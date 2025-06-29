import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'How do I book an appointment?',
    answer: 'Go to the “Appointments” section in the sidebar, then click “Book New.” Choose your doctor and time slot, and confirm the appointment.',
  },
  {
    question: 'How can I access my medical records?',
    answer: 'Navigate to “Medical Records” from the sidebar to view, download, or share your health history securely.',
  },
 
  {
    question: 'What should I do if I miss a dose of medication?',
    answer: 'If you miss a dose, take it as soon as you remember unless it is almost time for your next dose. Do not double up doses.',
  },
  {
    question: 'How do I update my personal information?',
    answer: 'Go to the “Profile” section in the app sidebar to update your contact information, insurance details, and preferences.',
  },
  {
    question: 'Can I share my medical records with my doctor?',
    answer: 'Yes, you can securely share your medical records via the “Medical Records” section by generating a shareable link or granting access directly.',
  },
  {
    question: 'Still have questions?',
    answer: (
      <>
        Contact our support team at{' '}
        <a href="mailto:support@medicareapp.com" className="text-primary underline font-medium">
          support@medicareapp.com
        </a>{' '}
        or call 1-800-987650.
      </>
    ),
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="help__page">
      <div className="d-flex justify-content-center flex-column  align-items-center">
        
        <h1 className="title d-flex justify-content-center align-items-center "><HelpCircle size={28} className="text-primary m-2" /><span>Help Center</span></h1>
          <p className="subtitle text-neutral text-center mb-6 max-w-2xl">
          Need assistance? Here are some frequently asked questions and contact options to help you out.
        </p>
      </div>

      <div className="help__grid grid gap-4 max-w-2xl">
        {faqs.map(({ question, answer }, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="d-flex align-items-start justify-content-center  flex-column bg-white p-5 rounded-lg shadow-sm"
            >
              <button
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-button-${i}`}
                onClick={() => toggle(i)}
                className="help-btn d-flex w-full"
              >
                <span>{question}</span>
                {isOpen ? (
                  <ChevronUp className="icon" />
                ) : (
                  <ChevronDown className="icon" />
                )}
              </button>

              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-button-${i}`}
                style={{
                  maxHeight: isOpen ? '1000px' : '0',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease, opacity 0.3s ease',
                }}
                className="text-sm text-neutral"
              >
                {answer}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
