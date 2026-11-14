import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, UsersRound } from "lucide-react";
import BrandMark from "@/app/components/shared/brand-mark";

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Post vacancies",
    description: "Create and manage job postings from one employer workspace.",
  },
  {
    icon: UsersRound,
    title: "Review applicants",
    description: "Keep candidate applications and hiring activity organized.",
  },
  {
    icon: Building2,
    title: "Verify employers",
    description: "Give administrators the tools to review accounts and postings.",
  },
];

export default function HomePage() {
  return (
    <div className="public-home-page">
      <header className="public-header">
        <Link className="public-brand" href="/" aria-label="OnlineJobBoard home">
          <BrandMark />
          <span>OnlineJobBoard</span>
        </Link>
        <nav className="public-header-actions" aria-label="Main navigation">
          <Link className="public-sign-in" href="/login">Sign in</Link>
          <Link className="public-header-cta" href="/employer/register">Post a vacancy</Link>
        </nav>
      </header>

      <main className="public-home">
        <section className="public-hero">
          <div className="public-hero-copy">
            <p className="public-eyebrow">ONLINE JOB BOARD</p>
            <h1>Find the right people. Build what&apos;s next.</h1>
            <p className="public-hero-lead">
              A clear, connected workspace for employers to manage vacancies and
              applicants, with tools for administrators to keep the platform moving.
            </p>
            <div className="public-hero-actions">
              <Link className="public-primary-action" href="/employer/register">
                Get started as an employer <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className="public-secondary-action" href="/login">Sign in</Link>
            </div>
            <p className="public-hero-note">Already registered? Sign in to continue to your workspace.</p>
          </div>

          <aside className="public-preview" aria-label="Platform capabilities">
            <div className="public-preview-heading">
              <span className="public-preview-mark"><BriefcaseBusiness aria-hidden="true" size={18} /></span>
              <div>
                <strong>Your hiring workspace</strong>
                <span>Everything in one place</span>
              </div>
            </div>
            <div className="public-preview-item">
              <span className="public-preview-icon"><Building2 aria-hidden="true" size={17} /></span>
              <span><strong>Employer workspace</strong><small>Vacancies and applicants</small></span>
              <span className="public-preview-status">Ready</span>
            </div>
            <div className="public-preview-item">
              <span className="public-preview-icon"><UsersRound aria-hidden="true" size={17} /></span>
              <span><strong>Applicant management</strong><small>Review the hiring pipeline</small></span>
              <span className="public-preview-status">Organized</span>
            </div>
            <div className="public-preview-note">
              <span aria-hidden="true">✓</span>
              <p>Simple tools to support every step of your recruitment workflow.</p>
            </div>
          </aside>
        </section>

        <section className="public-features" aria-label="Platform features">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="public-feature" key={title}>
              <span className="public-feature-icon"><Icon aria-hidden="true" size={19} /></span>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="public-footer">
        OnlineJobBoard <span aria-hidden="true">·</span> Connecting employers with the right talent
      </footer>
    </div>
  );
}
