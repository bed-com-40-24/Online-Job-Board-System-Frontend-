type ScreenHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function ScreenHeading({ eyebrow, title, subtitle, onBack }: ScreenHeadingProps) {
  return (
    <header className="page-heading">
      <button className="secondary" type="button" onClick={onBack}>Back</button>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>
    </header>
  );
}
