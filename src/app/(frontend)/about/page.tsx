import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our blog and our mission.',
}

export default function AboutPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          <h1>About Us</h1>

          <p className="lead">
            Welcome to our corner of the internet. We&apos;re passionate about sharing ideas,
            stories, and insights that matter.
          </p>

          <h2>Our Mission</h2>
          <p>
            We believe in the power of thoughtful content to inspire, educate, and connect people.
            Our mission is to create a space where curiosity thrives and meaningful conversations
            begin.
          </p>

          <h2>What We Write About</h2>
          <p>
            From technology and innovation to culture and society, we explore topics that shape our
            world. Our writers bring diverse perspectives and deep expertise to every piece we
            publish.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li>
              <strong>Quality over quantity</strong> - We take time to craft content that truly adds
              value.
            </li>
            <li>
              <strong>Authenticity</strong> - We share genuine perspectives, not just popular
              opinions.
            </li>
            <li>
              <strong>Accessibility</strong> - We believe knowledge should be available to everyone.
            </li>
            <li>
              <strong>Continuous learning</strong> - We&apos;re always exploring, questioning, and
              growing.
            </li>
          </ul>

          <h2>Join Our Community</h2>
          <p>
            Whether you&apos;re here to learn something new, find inspiration, or simply enjoy a
            good read, we&apos;re glad you found us. Feel free to explore our posts and join the
            conversation.
          </p>
        </div>
      </div>
    </div>
  )
}
