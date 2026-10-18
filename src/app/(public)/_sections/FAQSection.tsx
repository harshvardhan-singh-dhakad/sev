import { FAQ } from '@/lib/types';
import { FAQAccordion } from './FAQAccordion';

const DEMO_FAQS: FAQ[] = [
  {
    id: 'f1', displayOrder: 1, active: true,
    question: 'What varieties of Sev does Aron Bites offer?',
    answer: 'Aron Bites offers a wide range of Sev including Indori Sev, Ratlami Sev, Nylon Sev, Plain Sev, Tikha Sev, Garlic Sev, Premium Sev, and Special Sev. Each variety is available in multiple weight options.',
    createdAt: '', updatedAt: '',
  },
  {
    id: 'f2', displayOrder: 2, active: true,
    question: 'What is the minimum quantity for bulk orders?',
    answer: 'Our bulk orders start from 10 KG. We offer pricing tiers for 10 KG, 25 KG, 50 KG, 100 KG (1 Quintal), 500 KG (5 Quintal), and custom quantities. Contact us for a customized quote.',
    createdAt: '', updatedAt: '',
  },
  {
    id: 'f3', displayOrder: 3, active: true,
    question: 'Can I get a sample before placing a bulk order?',
    answer: 'Absolutely! We offer free samples for prospective bulk buyers. Visit our Samples page, fill in your requirements, and our team will process your sample request within 24 hours.',
    createdAt: '', updatedAt: '',
  },
  {
    id: 'f4', displayOrder: 4, active: true,
    question: 'What is the shelf life of your Sev?',
    answer: 'Our Sev has a shelf life of 3–6 months when stored in a cool, dry place in an airtight container. Each product package clearly mentions the best-before date. Do not refrigerate.',
    createdAt: '', updatedAt: '',
  },
  {
    id: 'f5', displayOrder: 5, active: true,
    question: 'Do you ship across India?',
    answer: 'Yes! We deliver pan India. Free shipping is available above a certain order value for retail orders. Bulk orders are delivered via our logistics partners with competitive shipping rates.',
    createdAt: '', updatedAt: '',
  },
  {
    id: 'f6', displayOrder: 6, active: true,
    question: 'How do I track my order?',
    answer: 'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can also track your order from your Account > Orders section on our website.',
    createdAt: '', updatedAt: '',
  },
];

async function getFAQs(): Promise<FAQ[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/faqs?active=true`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return DEMO_FAQS;
    const data = await res.json();
    return data.faqs?.length ? data.faqs : DEMO_FAQS;
  } catch {
    return DEMO_FAQS;
  }
}

export async function FAQSection() {
  const faqs = await getFAQs();
  return <FAQAccordion faqs={faqs} />;
}