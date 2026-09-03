import { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { contactMessageAPI } from '../utils/api';

const CONTACT_METHODS = [
  { icon: Mail, label: 'Email Us', value: 'contact@urbannest.com', hint: 'Send us your questions.' },
  { icon: Phone, label: 'Call Us', value: '+95 9 777 000 111', hint: 'Mon–Fri, 9:00 AM – 6:00 PM.' },
  { icon: MessageCircle, label: 'Viber Us', value: '+95 9 777 000 111', hint: 'Fastest way to reach us.' },
  { icon: MapPin, label: 'Visit Us', value: 'Yangon, Myanmar', hint: 'By appointment only.' },
];

export function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { name?: string; email?: string; message?: string } = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.email.trim()) next.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email address.';
    if (!form.message.trim()) next.message = 'Please enter your message.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await contactMessageAPI.create({
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('We could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Hero */}
        <section className="contact-hero">
          <span className="contact-hero-badge">Get in Touch</span>
          <h1 className="contact-hero-title">We'd Love to Hear From You</h1>
          <p className="contact-hero-sub">
            Questions about a listing, managing your properties, or the platform itself — our team is here to help.
          </p>
        </section>

        {/* Contact methods */}
        <section className="contact-methods-grid">
          {CONTACT_METHODS.map((method) => (
            <div className="contact-method-card" key={method.label}>
              <div className="contact-method-icon"><method.icon /></div>
              <div className="contact-method-label">{method.label}</div>
              <div className="contact-method-value">{method.value}</div>
              <div className="contact-method-hint">{method.hint}</div>
            </div>
          ))}
        </section>

        {/* Form + Office hours */}
        <section className="contact-main">
          <div className="contact-form-card">
            <h2 className="contact-form-title">Send Us a Message</h2>
            <p className="contact-form-sub">Fill out the form and our team will review your message.</p>

            {submitted ? (
              <div className="contact-success">
                <CheckCircle2 />
                <h3>Message Sent!</h3>
                <p>Thank you, {form.name.trim()}. We've received your message.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Your name"
                  />
                  {errors.name && <span className="contact-field-error">{errors.name}</span>}
                </div>
                <div className="contact-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@example.com"
                  />
                  {errors.email && <span className="contact-field-error">{errors.email}</span>}
                </div>
                <div className="contact-field">
                  <label>Phone (optional)</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+95 9 ..."
                  />
                </div>
                <div className="contact-field">
                  <label>Message</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="How can we help?"
                  />
                  {errors.message && <span className="contact-field-error">{errors.message}</span>}
                </div>
                {submitError && (
                  <div className="contact-submit-error" role="alert">{submitError}</div>
                )}
                <button type="submit" className="contact-submit-btn" disabled={submitting}>
                  <Send /> {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="contact-side">
            <div className="contact-side-card">
              <div className="contact-side-icon"><Clock /></div>
              <h3>Office Hours</h3>
              <ul className="contact-hours">
                <li><span>Monday – Friday</span><span>9:00 AM – 6:00 PM</span></li>
                <li><span>Saturday</span><span>9:00 AM – 1:00 PM</span></li>
                <li><span>Sunday</span><span>Closed</span></li>
              </ul>
            </div>
            <div className="contact-side-card">
              <div className="contact-side-icon"><MapPin /></div>
              <h3>Our Office</h3>
              <p className="contact-office-desc">
                UrbanNest Real Estate Co., Ltd.<br />
                Yangon, Myanmar
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
