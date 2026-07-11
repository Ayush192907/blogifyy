import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PublicLayout from '../../components/layout/PublicLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pageContent, setPageContent] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('pages')
      .select('content')
      .eq('slug', 'contact')
      .eq('status', 'published')
      .eq('enabled', true)
      .single()
      .then(({ data }) => {
        if (data?.content) {
          setPageContent(data.content);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus('loading');

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || null,
        message: message.trim(),
        read: false,
      });

    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }
  };

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';
  const contactBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': siteUrl
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Contact',
        'item': `${siteUrl}/contact`
      }
    ]
  };

  return (
    <PublicLayout>
      <SEO 
        title="Contact Us"
        description="Have questions or feedback? Send us a message and our support team will reply as soon as possible."
        schemaJson={contactBreadcrumbs}
      />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Get in Touch</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Have any questions, suggestions, or just want to say hello? Send us a message and we'll reply as soon as possible.
          </p>
        </div>

        {pageContent && (
          <div className="max-w-3xl mx-auto mb-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 sm:p-8 shadow-sm">
            <div
              className="prose dark:prose-invert max-w-none prose-sm sm:prose-base dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: pageContent }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Details */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="font-bold text-gray-800 dark:text-white text-lg border-b border-gray-100 dark:border-gray-700 pb-3">
                Contact Information
              </h2>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Email Us</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">support@blogify.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Call Us</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Location</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    123 Innovation Way, Tech District, SF, CA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 sm:p-8 shadow-sm">
              {status === 'success' ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                    <Send size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Message Sent Successfully!</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Thank you for reaching out. We have received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="message" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                    <Send size={14} />
                  </button>

                  {status === 'error' && (
                    <p className="text-xs text-red-500 font-semibold mt-2">
                      An error occurred while sending your message. Please try again.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
