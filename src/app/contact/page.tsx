"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 py-1 flex items-center gap-3 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <Image
            src="/dash-diet-logo.svg"
            alt="DashDiet"
            width={240}
            height={80}
            className="h-20 w-auto"
          />
        </Link>
      </header>

      <div className="px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-sm text-gray-500 mb-8">
            Have a question or need help? We&apos;d love to hear from you.
          </p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
              <p className="text-sm text-gray-500 mb-6">
                We&apos;ll get back to you within 24 hours.
              </p>
              <Link href="/" className="text-dash-blue font-medium text-sm">
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-dash-blue focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-dash-blue focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-dash-blue focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button type="submit" className="btn-primary">
                Send Message
              </button>
            </form>
          )}

          <div className="mt-12 p-5 bg-gray-50 rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-3">Other ways to reach us</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: support@trydashdiet.com</p>
              <p>Response time: Within 24 hours</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
