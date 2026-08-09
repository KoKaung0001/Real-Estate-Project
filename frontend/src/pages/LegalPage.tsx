import { ShieldCheck, FileText, Cookie } from 'lucide-react';

interface LegalPageProps {
  section: 'privacy' | 'terms' | 'cookies';
}

const CONTENT: Record<LegalPageProps['section'], { icon: typeof ShieldCheck; title: string; intro: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    icon: ShieldCheck,
    title: 'Privacy Policy',
    intro:
      'UrbanNest is committed to protecting your personal information. This policy explains what we collect and how it is used.',
    sections: [
      {
        heading: 'Information We Collect',
        body:
          'When you create an account or submit a listing, we collect details such as your username, email address, phone number, and the property information you provide.',
      },
      {
        heading: 'How We Use Your Information',
        body:
          'Your information is used to manage your account, power your property listings, and enable buyers to contact you directly. We do not sell your personal data to third parties.',
      },
      {
        heading: 'Data Storage',
        body:
          'This is a demo application: your account and listing data are stored locally in your browser for demonstration purposes.',
      },
      {
        heading: 'Contact Us',
        body: 'If you have questions about this policy, reach us at contact@urbannest.com.',
      },
    ],
  },
  terms: {
    icon: FileText,
    title: 'Terms of Service',
    intro: 'Please read these terms carefully before using UrbanNest.',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body:
          'By accessing UrbanNest, you agree to these terms. If you do not agree, please refrain from using the platform.',
      },
      {
        heading: 'Use of the Platform',
        body:
          'You agree to provide accurate information and not to misuse the platform for fraudulent or unlawful activity.',
      },
      {
        heading: 'Listings & Transactions',
        body:
          'UrbanNest facilitates listing and discovery only. All financial transactions and escrow handling are conducted independently between buyers and sellers.',
      },
      {
        heading: 'Limitation of Liability',
        body:
          'The platform is provided as an academic demonstration project, and we make no warranties regarding availability or completeness of listings.',
      },
    ],
  },
  cookies: {
    icon: Cookie,
    title: 'Cookie Policy',
    intro: 'UrbanNest uses local browser storage to provide a smooth, personalized experience.',
    sections: [
      {
        heading: 'What We Use',
        body:
          'This application uses your browser\u2019s local storage to persist your session, saved favorites, and property data. No cookies are shared with third parties.',
      },
      {
        heading: 'Managing Storage',
        body:
          'You can clear this data at any time through your browser\u2019s settings, or by signing out and clearing site data.',
      },
      {
        heading: 'Contact Us',
        body: 'Questions about this policy? Email contact@urbannest.com.',
      },
    ],
  },
};

export function LegalPage({ section }: LegalPageProps) {
  const content = CONTENT[section];

  return (
    <div className="legal-page">
      <div className="legal-container">
        <section className="legal-head">
          <div className="legal-head-icon"><content.icon /></div>
          <h1 className="legal-head-title">{content.title}</h1>
          <p className="legal-head-intro">{content.intro}</p>
        </section>

        <section className="legal-body">
          {content.sections.map((item) => (
            <div className="legal-block" key={item.heading}>
              <h2 className="legal-block-title">{item.heading}</h2>
              <p className="legal-block-body">{item.body}</p>
            </div>
          ))}
        </section>

        <p className="legal-updated">Last updated: August 2026</p>
      </div>
    </div>
  );
}
