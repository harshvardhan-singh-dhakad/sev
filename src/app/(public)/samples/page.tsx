'use client';

import { useState } from 'react';
import { Package, CheckCircle2, ShieldCheck, Clock, Box } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import toast from 'react-hot-toast';

export default function SamplesPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      businessName: formData.get('businessName'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      pincode: formData.get('pincode'),
      productInterests: formData.get('productInterests'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success('Sample request submitted successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to request sample');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-blue-50 py-16 border-b border-blue-100">
        <div className="container-site text-center max-w-3xl">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
            Try Before You Buy
          </h1>
          <p className="text-slate-600 text-lg">
            Are you a retailer or distributor looking to place a bulk order? Request a free sample box to experience the quality and crunch of Rasvat Sev firsthand.
          </p>
        </div>
      </div>

      <div className="container-site py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                How it works
              </h2>
              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, title: 'Verification', desc: 'We verify your business details to ensure you are a genuine B2B buyer.' },
                  { icon: Box, title: 'Preparation', desc: 'We prepare a custom sample box with your selected varieties.' },
                  { icon: Clock, title: 'Dispatch', desc: 'Samples are dispatched within 48 hours via express shipping.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <step.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{step.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Please Note:</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                <li>Samples are exclusively for B2B/Bulk buyers.</li>
                <li>We provide 50g-100g sample packs of up to 4 varieties.</li>
                <li>Shipping charges may apply depending on your location.</li>
                <li>Sample requests are subject to approval.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center h-full py-12">
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Sample Request Received!
                  </h2>
                  <p className="text-slate-600 mb-8 max-w-md">
                    Thank you! We've received your sample request. Our team will verify your details and process the shipment. We'll email you the tracking details once dispatched.
                  </p>
                  <button onClick={() => setSuccess(false)} className="btn btn-primary">
                    Request Another Sample
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Sample Request Form
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="form-label">Business / Shop Name *</label>
                        <input type="text" name="businessName" required className="form-input" placeholder="E.g. Sharma Provision Store" />
                      </div>
                      
                      <div>
                        <label className="form-label">Contact Person *</label>
                        <input type="text" name="name" required className="form-input" placeholder="Your name" />
                      </div>
                      
                      <div>
                        <label className="form-label">Phone Number *</label>
                        <input type="tel" name="phone" required className="form-input" placeholder="+91 98765 43210" />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="form-label">Email Address</label>
                        <input type="email" name="email" className="form-input" placeholder="you@company.com" />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="font-semibold text-slate-900 mb-4">Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="form-label">Complete Address *</label>
                          <textarea name="address" required rows={2} className="form-input py-2" placeholder="Shop No, Street, Landmark"></textarea>
                        </div>
                        <div>
                          <label className="form-label">City *</label>
                          <input type="text" name="city" required className="form-input" placeholder="City" />
                        </div>
                        <div>
                          <label className="form-label">State *</label>
                          <input type="text" name="state" required className="form-input" placeholder="State" />
                        </div>
                        <div>
                          <label className="form-label">PIN Code *</label>
                          <input type="text" name="pincode" required className="form-input" placeholder="6-digit PIN" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="font-semibold text-slate-900 mb-4">Sample Preferences</h3>
                      <div>
                        <label className="form-label">Which varieties do you want to test? *</label>
                        <input type="text" name="productInterests" required className="form-input" placeholder="E.g., Indori, Ratlami, Nylon (Max 4)" />
                        <p className="text-xs text-slate-500 mt-1.5">Please list up to 4 varieties.</p>
                      </div>
                      <div className="mt-4">
                        <label className="form-label">Any specific notes for our team?</label>
                        <textarea name="message" rows={2} className="form-input py-2" placeholder="Optional notes"></textarea>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center btn-lg mt-4">
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}