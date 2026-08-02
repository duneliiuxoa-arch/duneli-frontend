import { useEffect } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { ArrowLeft, Shield, Mic, Database, Share2, Lock, Trash2, Baby, Globe2, RefreshCcw, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import duneliLogo from '../../assets/logo.png';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

const LAST_UPDATED = 'July 31, 2026';

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f5f7ff 100%)', fontFamily: 'var(--font-body)' }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-blue-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B5BF6] hover:text-[#7C3AED] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <img src={duneliLogo} alt="Duneli" className="h-7 w-auto object-contain select-none" draggable={false} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-5"
            style={{ background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black text-[#1A1A2E] tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Privacy Policy
          </h1>
          <p className="text-[#1A1A2E]/50 text-sm mt-2">Last updated: {LAST_UPDATED}</p>
          <p className="text-[#1A1A2E]/70 text-base leading-relaxed mt-5 max-w-2xl">
            Duneli ("we", "us", "our") operates the Duneli mobile and web application (the "App"),
            which provides anonymous, audio-based group discussions. This Privacy Policy explains
            what information we collect, how we use and share it, and the choices and rights you
            have. By using Duneli, you agree to the collection and use of information in
            accordance with this policy.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-10">
          <Section icon={Database} color="#3B5BF6" title="1. Information We Collect">
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Account information:</strong> a display name/pseudonym, and if you sign in,
                an email address or identifier provided by your sign-in method. Duneli
                conversations themselves remain anonymous to other participants.
              </li>
              <li>
                <strong>Audio data:</strong> with your permission, we access your device
                microphone to transmit your voice during live discussions. Audio is streamed in
                real time through our audio infrastructure provider and is not stored after a
                session ends unless a discussion host enables recording, in which case you will be
                notified before joining.
              </li>
              <li>
                <strong>Content you create:</strong> discussion titles, topics, comments, "shown
                interest" actions, and feedback you submit after a discussion.
              </li>
              <li>
                <strong>Usage and diagnostic data:</strong> app interactions, session duration,
                crash logs, and performance data, collected automatically to help us maintain and
                improve the App.
              </li>
              <li>
                <strong>Device and log information:</strong> device model, operating system,
                unique device identifiers, IP address, and general (non-precise) location derived
                from IP address for language/region defaults.
              </li>
            </ul>
          </Section>

          <Section icon={Mic} color="#7C3AED" title="2. Permissions We Request">
            <p>Duneli requests the following device permissions, only for the stated purpose:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Microphone:</strong> required to speak in live audio discussions.</li>
              <li><strong>Notifications:</strong> to alert you when a discussion you're interested in starts or is about to begin.</li>
            </ul>
            <p className="mt-2">
              You can deny or revoke these permissions at any time in your device settings;
              doing so may limit certain features (for example, you won't be able to speak
              without microphone access).
            </p>
          </Section>

          <Section icon={Share2} color="#F97316" title="3. How We Use and Share Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Operate, maintain, and provide the core features of the App;</li>
              <li>Connect you to live audio rooms and route real-time audio between participants;</li>
              <li>Personalize discovery of discussions (categories, language, trending topics);</li>
              <li>Send service notifications you have opted into;</li>
              <li>Monitor, detect, and prevent abuse, harassment, spam, and violations of our Community Guidelines;</li>
              <li>Analyze aggregated usage trends to improve the App.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your personal information. We share information only with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Service providers</strong> who process data on our behalf, such as our
                cloud hosting and database provider (Firebase/Google Cloud) and our real-time
                audio communication provider (Agora), strictly to deliver the App's functionality;
              </li>
              <li>
                <strong>Other participants</strong> in a discussion, limited to your chosen
                display name, spoken audio, and any content you post — never your real identity
                unless you choose to reveal it;
              </li>
              <li>
                <strong>Legal and safety authorities</strong>, where required to comply with law,
                enforce our terms, or protect the rights, safety, and property of Duneli, our
                users, or the public.
              </li>
            </ul>
          </Section>

          <Section icon={Lock} color="#3B5BF6" title="4. Data Security & Retention">
            <p>
              We use industry-standard safeguards — including encryption in transit, access
              controls, and secure cloud infrastructure — to protect your information. However, no
              method of transmission or storage is 100% secure, and we cannot guarantee absolute
              security.
            </p>
            <p className="mt-2">
              We retain account and content data for as long as your account is active or as
              needed to provide the App. Live audio itself is not retained after a session unless
              recording was explicitly enabled and disclosed. Diagnostic and crash logs are
              retained for a limited period for troubleshooting purposes.
            </p>
          </Section>

          <Section icon={Trash2} color="#7C3AED" title="5. Your Rights & Account/Data Deletion">
            <p>
              Depending on your location, you may have the right to access, correct, export, or
              delete your personal information, and to object to or restrict certain processing.
            </p>
            <p className="mt-2">
              You can request deletion of your account and associated personal data at any time by:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Using the <strong>Delete Account</strong> option in the App's account settings (where available); or</li>
              <li>
                Emailing <a href="mailto:Iuxoa.officail@gmail.com" className="text-[#3B5BF6] font-semibold underline underline-offset-2">Iuxoa.officail@gmail.com</a> with the subject line "Account Deletion Request".
              </li>
            </ul>
            <p className="mt-2">
              We will act on verified deletion requests within 30 days, except where we are
              required to retain certain information for legal, security, or fraud-prevention
              purposes.
            </p>
          </Section>

          <Section icon={Baby} color="#F97316" title="6. Children's Privacy">
            <p>
              Duneli is not directed to children under 13 (or the minimum age required in your
              country), and we do not knowingly collect personal information from children. If we
              learn that we have collected personal information from a child without verified
              parental consent, we will delete that information promptly. If you believe a child
              has provided us with personal information, please contact us using the details below.
            </p>
          </Section>

          <Section icon={Globe2} color="#3B5BF6" title="7. International Data Transfers">
            <p>
              Your information may be processed and stored on servers located outside of your
              country of residence, including in the United States, where our service providers
              operate. We take steps to ensure appropriate safeguards are in place consistent with
              applicable data protection laws whenever data is transferred internationally.
            </p>
          </Section>

          <Section icon={RefreshCcw} color="#7C3AED" title="8. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices or for legal, operational, or regulatory reasons. We will notify you of
              material changes by updating the "Last updated" date above and, where appropriate,
              through an in-app notice. Continued use of the App after changes take effect
              constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section icon={Mail} color="#F97316" title="9. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or your
              personal information, please contact us at:
            </p>
            <p className="mt-2 font-semibold text-[#1A1A2E]">
              Email: <a href="mailto:Iuxoa.officail@gmail.com" className="text-[#3B5BF6] underline underline-offset-2">Iuxoa.officail@gmail.com</a>
            </p>
          </Section>
        </div>

        {/* Footer note */}
        <div className="mt-14 pt-8 border-t border-blue-100 text-center">
          <p className="text-[#1A1A2E]/40 text-xs">
            © {new Date().getFullYear()} Duneli. All rights reserved.
          </p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Duneli
          </button>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  icon: ComponentType<{ className?: string }>;
  color: string;
  title: string;
  children: ReactNode;
}

function Section({ icon: Icon, color, title, children }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}1A` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <h2 className="text-lg font-extrabold text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {title}
        </h2>
      </div>
      <div className="text-[#1A1A2E]/70 text-sm leading-relaxed pl-12">{children}</div>
    </motion.section>
  );
}
