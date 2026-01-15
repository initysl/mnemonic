export default function PrivacyPolicyPage() {
  return (
    <main className='min-h-screen bg-white text-neutral-900 px-4 py-16'>
      <section className='mx-auto max-w-4xl space-y-10'>
        <header className='space-y-3'>
          <p className='text-sm uppercase tracking-widest text-neutral-500'>
            Privacy Policy
          </p>
          <h1 className='text-4xl font-semibold tracking-tight'>
            Privacy Policy for Mnemonic
          </h1>
          <p className='text-sm text-neutral-500'>Last updated: 2026-01-15</p>
        </header>

        <div className='space-y-8 text-sm leading-7 text-neutral-700'>
          <p>
            Mnemonic is a notes and memory assistant that helps you organize and
            search your personal knowledge. This Privacy Policy explains how we
            collect, use, and share information when you use the Mnemonic
            application and related services (the "Service").
          </p>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Information We Collect
            </h2>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                Account information, such as your name, email address, and
                authentication identifiers when you sign in.
              </li>
              <li>
                Content you create, including notes, tags, and prompts that you
                save in the Service.
              </li>
              <li>
                Usage data, such as pages viewed, feature interactions, and
                basic device or browser information.
              </li>
              <li>
                Diagnostic data, including error logs and performance metrics.
              </li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              How We Use Information
            </h2>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Provide, maintain, and improve the Service.</li>
              <li>Authenticate users and secure access to accounts.</li>
              <li>Personalize your experience and organize your content.</li>
              <li>Diagnose issues and prevent abuse.</li>
              <li>Communicate important updates about the Service.</li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              How We Share Information
            </h2>
            <p>
              We do not sell your personal information. We share information
              only as necessary to operate the Service, including with:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                Service providers that help us host, secure, and operate the
                Service.
              </li>
              <li>
                Authentication providers (such as Auth0) to enable secure login.
              </li>
              <li>
                Law enforcement or regulators when required by applicable law.
              </li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Data Retention
            </h2>
            <p>
              We retain your information for as long as your account is active
              or as needed to provide the Service. You can request deletion of
              your account and associated data at any time.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>Security</h2>
            <p>
              We use reasonable technical and organizational measures to protect
              your information. No system is completely secure, so we cannot
              guarantee absolute security.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Cookies and Similar Technologies
            </h2>
            <p>
              We use cookies and similar technologies to keep you signed in,
              remember preferences, and measure usage. You can control cookies
              through your browser settings.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Your Rights and Choices
            </h2>
            <p>
              Depending on your location, you may have rights to access,
              correct, delete, or export your information. You may also object
              to or restrict certain processing.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Children’s Privacy
            </h2>
            <p>
              The Service is not directed to children under 13, and we do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make
              material changes, we will provide notice by updating the date
              above or by other appropriate means.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, contact us at
              support@mnemonic.app.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
