'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Truck, Store, MapPin, Building2, CheckCircle2, ChevronDown } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: Truck, title: 'Reliable Pan-India Delivery', desc: 'Timely dispatch and secure logistics across the country.' },
  { icon: Building2, title: 'Competitive B2B Pricing', desc: 'Tiered volume discounts starting from 10 KG.' },
  { icon: Store, title: 'Retail-Ready Packaging', desc: 'Option for bulk bags or pre-packaged retail pouches.' },
  { icon: MapPin, title: 'Direct from Factory', desc: 'Authentic taste with maximum shelf life guaranteed.' },
];

export default function BulkOrdersPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitFeedback(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      city: formData.get('city'),
      state: formData.get('state'),
      requirements: formData.get('requirements'),
      estimatedQuantity: formData.get('estimatedQuantity'),
      message: formData.get('message'),
    };

    // Client-side required field validation
    const validationErrors: Record<string, string> = {};
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      validationErrors.name = 'Contact person name is required';
    }
    if (!data.company || typeof data.company !== 'string' || !data.company.trim()) {
      validationErrors.company = 'Company / business name is required';
    }
    if (!data.phone || typeof data.phone !== 'string' || !data.phone.trim()) {
      validationErrors.phone = 'Phone number is required';
    }
    if (!data.city || typeof data.city !== 'string' || !data.city.trim()) {
      validationErrors.city = 'City is required';
    }
    if (!data.state || typeof data.state !== 'string' || !data.state.trim()) {
      validationErrors.state = 'State is required';
    }
    if (!data.requirements || typeof data.requirements !== 'string' || !data.requirements.trim()) {
      validationErrors.requirements = 'Please specify which products you need';
    }
    if (!data.estimatedQuantity || typeof data.estimatedQuantity !== 'string' || !data.estimatedQuantity.trim()) {
      validationErrors.estimatedQuantity = 'Please select estimated monthly quantity';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstInvalidField = Object.keys(validationErrors)[0];
      const element = document.getElementById(`bulk-${firstInvalidField}`);
      if (element) {
        element.focus();
      }
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/bulk-enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        setSubmitFeedback({ type: 'success', message: 'Enquiry submitted successfully!' });
        toast.success('Enquiry submitted successfully!');
      } else {
        const err = await res.json();
        const errorMessage = err.error || 'Failed to submit enquiry';
        setSubmitFeedback({ type: 'error', message: errorMessage });
        toast.error(errorMessage);
      }
    } catch {
      const networkErrorMessage = 'Network error. Please try again.';
      setSubmitFeedback({ type: 'error', message: networkErrorMessage });
      toast.error(networkErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-ink text-white py-16 relative">
        <div className="container-site text-center">
          <div className="flex justify-center mb-4">
            <span
              className="inline-flex items-center px-3 py-1 rounded-[var(--radius-badge)] text-xs font-bold uppercase tracking-wider bg-secondary"
              style={{ color: 'var(--color-ink)' }}
            >
              B2B & WHOLESALE
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-bg-white)' }}
          >
            Premium Sev for Your{' '}
            <span style={{ color: 'var(--color-secondary)' }}>
              Business
            </span>
          </h1>
          <p
            className="text-border-dark text-base sm:text-lg md:text-xl max-w-[720px] mx-auto text-center"
            style={{ textWrap: 'balance' }}
          >
            Partner with Rasvat for reliable bulk supply of authentic Indian Sev. Perfect for retail stores, restaurants, caterers, and distributors.
          </p>
        </div>
      </section>

      {/* Content Grid (48px gap between hero and content) */}
      <section className="container-site mt-12 mb-20">
        <div className="flex flex-col lg:grid lg:grid-cols-[360px_1fr] gap-8 items-start">
          
          {/* Left Column on Desktop (360px sticky) / Rendered After Form on Mobile (<1024px) */}
          <div className="order-2 lg:order-1 w-full space-y-6 lg:sticky lg:top-[calc(var(--header-height,80px)+24px)]">
            
            {/* "Why Partner With Us?" Card */}
            <div className="bg-bg-white border border-border rounded-[16px] shadow-[var(--shadow-card)] p-6">
              <h2
                className="text-[20px] font-bold mb-5"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}
              >
                Why Partner With Us?
              </h2>
              <ul className="space-y-5">
                {FEATURES.map((feature, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-[44px] h-[44px] rounded-full bg-accent-tint text-primary flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-base leading-snug"
                        style={{ color: 'var(--color-ink)' }}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-[14px] text-ink-muted mt-1 leading-relaxed">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* "Need a Sample First?" Card */}
            <div className="bg-secondary border border-secondary-dark rounded-[16px] shadow-[var(--shadow-card)] p-6">
              <h3
                className="font-bold text-xl mb-2"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)' }}
              >
                Need a Sample First?
              </h3>
              <p
                className="text-sm mb-5 leading-relaxed"
                style={{ color: 'var(--color-ink)' }}
              >
                We provide free samples to verified businesses before bulk ordering.
              </p>
              <Link
                href="/samples"
                className="inline-flex items-center justify-center w-full h-[48px] px-6 rounded-[10px] bg-ink font-semibold text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                style={{ color: 'var(--color-bg-white)' }}
              >
                Request Free Sample
              </Link>
            </div>

          </div>

          {/* Right Column on Desktop (1fr) / Rendered First on Mobile (<1024px) */}
          <div className="order-1 lg:order-2 w-full">
            <div className="bg-bg-white border border-border rounded-[16px] shadow-[var(--shadow-card)] p-6 sm:p-8">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-primary-faint text-primary rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)' }}
                  >
                    Enquiry Submitted Successfully!
                  </h2>
                  <p className="text-ink-muted mb-8 max-w-md text-base leading-relaxed">
                    Thank you for your interest in Rasvat. Our sales team will review your requirements and contact you within 24 business hours with a custom quote.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setSubmitFeedback(null);
                    }}
                    className="btn btn-outline text-ink hover:text-primary"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}
                  >
                    Request a Bulk Quote
                  </h2>
                  <p className="text-ink-muted text-sm mb-6">
                    Fill out the form below and our team will get back to you with pricing details.
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* 2-Column Field Grid (1 column below 640px) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      
                      {/* Name */}
                      <div>
                        <label htmlFor="bulk-name" className="text-ink text-[14px] font-semibold mb-1.5 block">
                          Contact Person Name <span className="text-primary font-bold ml-0.5" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bulk-name"
                          type="text"
                          name="name"
                          required
                          placeholder="Rahul Sharma"
                          onChange={() => clearFieldError('name')}
                          aria-invalid={errors.name ? 'true' : 'false'}
                          aria-describedby={errors.name ? 'bulk-name-error' : undefined}
                          className={`h-[48px] w-full px-4 rounded-[10px] border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 ${
                            errors.name
                              ? 'border-danger focus:border-danger focus:ring-danger/20'
                              : 'border-border focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                        {errors.name && (
                          <p id="bulk-name-error" className="text-xs text-danger mt-1.5 font-medium" role="alert">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Company */}
                      <div>
                        <label htmlFor="bulk-company" className="text-ink text-[14px] font-semibold mb-1.5 block">
                          Company / Business Name <span className="text-primary font-bold ml-0.5" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bulk-company"
                          type="text"
                          name="company"
                          required
                          placeholder="Sharma Traders"
                          onChange={() => clearFieldError('company')}
                          aria-invalid={errors.company ? 'true' : 'false'}
                          aria-describedby={errors.company ? 'bulk-company-error' : undefined}
                          className={`h-[48px] w-full px-4 rounded-[10px] border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 ${
                            errors.company
                              ? 'border-danger focus:border-danger focus:ring-danger/20'
                              : 'border-border focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                        {errors.company && (
                          <p id="bulk-company-error" className="text-xs text-danger mt-1.5 font-medium" role="alert">
                            {errors.company}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="bulk-phone" className="text-ink text-[14px] font-semibold mb-1.5 block">
                          Phone Number <span className="text-primary font-bold ml-0.5" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bulk-phone"
                          type="tel"
                          name="phone"
                          required
                          placeholder="+91 98765 43210"
                          onChange={() => clearFieldError('phone')}
                          aria-invalid={errors.phone ? 'true' : 'false'}
                          aria-describedby={errors.phone ? 'bulk-phone-error' : undefined}
                          className={`h-[48px] w-full px-4 rounded-[10px] border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 ${
                            errors.phone
                              ? 'border-danger focus:border-danger focus:ring-danger/20'
                              : 'border-border focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                        {errors.phone && (
                          <p id="bulk-phone-error" className="text-xs text-danger mt-1.5 font-medium" role="alert">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="bulk-email" className="text-ink text-[14px] font-semibold mb-1.5 block">
                          Email Address
                        </label>
                        <input
                          id="bulk-email"
                          type="email"
                          name="email"
                          placeholder="rahul@example.com"
                          className="h-[48px] w-full px-4 rounded-[10px] border border-border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label htmlFor="bulk-city" className="text-ink text-[14px] font-semibold mb-1.5 block">
                          City <span className="text-primary font-bold ml-0.5" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bulk-city"
                          type="text"
                          name="city"
                          required
                          placeholder="Mumbai"
                          onChange={() => clearFieldError('city')}
                          aria-invalid={errors.city ? 'true' : 'false'}
                          aria-describedby={errors.city ? 'bulk-city-error' : undefined}
                          className={`h-[48px] w-full px-4 rounded-[10px] border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 ${
                            errors.city
                              ? 'border-danger focus:border-danger focus:ring-danger/20'
                              : 'border-border focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                        {errors.city && (
                          <p id="bulk-city-error" className="text-xs text-danger mt-1.5 font-medium" role="alert">
                            {errors.city}
                          </p>
                        )}
                      </div>

                      {/* State */}
                      <div>
                        <label htmlFor="bulk-state" className="text-ink text-[14px] font-semibold mb-1.5 block">
                          State <span className="text-primary font-bold ml-0.5" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bulk-state"
                          type="text"
                          name="state"
                          required
                          placeholder="Maharashtra"
                          onChange={() => clearFieldError('state')}
                          aria-invalid={errors.state ? 'true' : 'false'}
                          aria-describedby={errors.state ? 'bulk-state-error' : undefined}
                          className={`h-[48px] w-full px-4 rounded-[10px] border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 ${
                            errors.state
                              ? 'border-danger focus:border-danger focus:ring-danger/20'
                              : 'border-border focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                        {errors.state && (
                          <p id="bulk-state-error" className="text-xs text-danger mt-1.5 font-medium" role="alert">
                            {errors.state}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Order Details Subheading Section (32px above, 1px divider, 16px below) */}
                    <div className="pt-8 mt-8 border-t border-border">
                      <h3
                        className="text-[18px] font-semibold mb-4"
                        style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)' }}
                      >
                        Order Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
                        
                        {/* Requirements */}
                        <div>
                          <label htmlFor="bulk-requirements" className="text-ink text-[14px] font-semibold mb-1.5 block">
                            Which products do you need? <span className="text-primary font-bold ml-0.5" aria-hidden="true">*</span>
                          </label>
                          <input
                            id="bulk-requirements"
                            type="text"
                            name="requirements"
                            required
                            placeholder="E.g., Indori Sev, Ratlami Sev"
                            onChange={() => clearFieldError('requirements')}
                            aria-invalid={errors.requirements ? 'true' : 'false'}
                            aria-describedby={errors.requirements ? 'bulk-requirements-error' : undefined}
                            className={`h-[48px] w-full px-4 rounded-[10px] border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 ${
                              errors.requirements
                                ? 'border-danger focus:border-danger focus:ring-danger/20'
                              : 'border-border focus:border-primary focus:ring-primary/20'
                            }`}
                          />
                          {errors.requirements && (
                            <p id="bulk-requirements-error" className="text-xs text-danger mt-1.5 font-medium" role="alert">
                              {errors.requirements}
                            </p>
                          )}
                        </div>

                        {/* Quantity Select */}
                        <div>
                          <label htmlFor="bulk-estimatedQuantity" className="text-ink text-[14px] font-semibold mb-1.5 block">
                            Estimated Monthly Quantity <span className="text-primary font-bold ml-0.5" aria-hidden="true">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="bulk-estimatedQuantity"
                              name="estimatedQuantity"
                              required
                              defaultValue=""
                              onChange={() => clearFieldError('estimatedQuantity')}
                              aria-invalid={errors.estimatedQuantity ? 'true' : 'false'}
                              aria-describedby={errors.estimatedQuantity ? 'bulk-estimatedQuantity-error' : undefined}
                              className={`h-[48px] w-full pl-4 pr-10 rounded-[10px] border appearance-none text-ink bg-bg-white text-sm transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                                errors.estimatedQuantity
                                  ? 'border-danger focus:border-danger focus:ring-danger/20'
                                  : 'border-border focus:border-primary focus:ring-primary/20'
                              }`}
                            >
                              <option value="" disabled>Select quantity</option>
                              <option value="10-25 KG">10 - 25 KG</option>
                              <option value="25-100 KG">25 - 100 KG</option>
                              <option value="1-5 Quintal">1 - 5 Quintal</option>
                              <option value="5+ Quintal">5+ Quintal</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-secondary" />
                          </div>
                          {errors.estimatedQuantity && (
                            <p id="bulk-estimatedQuantity-error" className="text-xs text-danger mt-1.5 font-medium" role="alert">
                              {errors.estimatedQuantity}
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Textarea */}
                      <div>
                        <label htmlFor="bulk-message" className="text-ink text-[14px] font-semibold mb-1.5 block">
                          Additional Message or Specific Requirements
                        </label>
                        <textarea
                          id="bulk-message"
                          name="message"
                          rows={4}
                          placeholder="Tell us about packaging preferences, target price, etc."
                          className="min-h-[140px] w-full p-4 rounded-[10px] border border-border text-ink bg-bg-white text-sm placeholder:text-text-muted transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                        />
                      </div>
                    </div>

                    {/* Submit Area: 52px tall button, full-width on mobile, auto-width right-aligned on desktop */}
                    <div className="pt-2 flex flex-col items-stretch sm:items-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="h-[52px] w-full sm:w-auto sm:min-w-[200px] px-8 rounded-[10px] bg-primary text-white font-semibold text-base hover:bg-primary-dark active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loading ? 'Submitting...' : 'Submit Enquiry'}
                      </button>

                      {/* Inline Feedback Below Button */}
                      {submitFeedback?.type === 'error' && (
                        <p className="text-xs text-danger mt-2 font-medium" role="alert">
                          {submitFeedback.message}
                        </p>
                      )}
                      {submitFeedback?.type === 'success' && (
                        <p className="text-xs text-success mt-2 font-medium" role="status">
                          {submitFeedback.message}
                        </p>
                      )}

                      <p className="text-xs text-ink-muted text-center sm:text-right mt-3">
                        By submitting this form, you agree to our privacy policy.
                      </p>
                    </div>

                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </section>
    </PublicLayout>
  );
}