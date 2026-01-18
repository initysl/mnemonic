export default function TermsPage() {
  return (
    <main className='min-h-screen bg-white text-neutral-900 px-4 py-16'>
      <section className='mx-auto max-w-4xl space-y-10'>
        <header className='space-y-3'>
          <p className='text-sm uppercase tracking-widest text-neutral-500'>
            Terms of Service
          </p>
          <h1 className='text-4xl font-semibold tracking-tight'>
            Terms of Service for Mnemonic
          </h1>
          <p className='text-sm text-neutral-500'>Last updated: 2025-01-15</p>
        </header>

        <div className='space-y-8 text-sm leading-7 text-neutral-700'>
          <p>
            These Terms of Service (the "Terms") govern your access to and use
            of the Mnemonic application and related services (the "Service"). By
            using the Service, you agree to these Terms.
          </p>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Eligibility and Accounts
            </h2>
            <p>
              You must be at least 13 years old to use the Service. You are
              responsible for safeguarding your account credentials and for all
              activity under your account.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Use the Service to violate any law or regulation.</li>
              <li>Attempt to access or disrupt the Service or its systems.</li>
              <li>Upload content that is unlawful, harmful, or infringing.</li>
              <li>Reverse engineer or misuse the Service.</li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Your Content
            </h2>
            <p>
              You retain ownership of content you submit to the Service. You
              grant us a limited license to host, process, and display your
              content solely to provide the Service to you.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Third-Party Services
            </h2>
            <p>
              The Service may integrate with third-party services, such as
              authentication providers. We are not responsible for third-party
              services, and your use of them is subject to their terms.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Service Availability and Changes
            </h2>
            <p>
              We may modify, suspend, or discontinue the Service at any time. We
              strive to keep the Service available but do not guarantee
              uninterrupted operation.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Disclaimers
            </h2>
            <p>
              The Service is provided "as is" and "as available" without
              warranties of any kind, express or implied.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, Mnemonic will not be
              liable for indirect, incidental, special, consequential, or
              punitive damages, or any loss of data, profits, or revenues.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Termination
            </h2>
            <p>
              You may stop using the Service at any time. We may suspend or
              terminate access to the Service if you violate these Terms.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. If we make material
              changes, we will provide notice by updating the date above or by
              other appropriate means.
            </p>
          </section>

          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-neutral-900'>Contact</h2>
            <p>
              Questions about these Terms can be sent to{' '}
              <a
                href='https://github.com/initysl'
                className='text-blue-500 underline'
              >
                initysl.
              </a>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
