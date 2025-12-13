import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us.',
}

export default function ContactPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          <h1>Contact Us</h1>

          <p className="lead">We&apos;d love to hear from you. Here&apos;s how you can reach us.</p>

          <h2>Get in Touch</h2>
          <p>
            Have a question, suggestion, or just want to say hello? We welcome all inquiries and
            feedback.
          </p>

          <div className="not-prose bg-card border border-border rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="font-medium text-foreground">Email:</span>
                <a href="mailto:hello@example.com" className="text-primary hover:underline">
                  hello@example.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="font-medium text-foreground">Location:</span>
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>

          <h2>Follow Us</h2>
          <p>Stay connected and follow our latest updates on social media:</p>
          <ul>
            <li>Twitter / X</li>
            <li>LinkedIn</li>
            <li>GitHub</li>
          </ul>

          <h2>Response Time</h2>
          <p>
            We aim to respond to all inquiries within 1-2 business days. Thank you for your
            patience.
          </p>
        </div>
      </div>
    </div>
  )
}
