export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4.25 4.25 0 1 0 0-8.5A4.25 4.25 0 0 0 12 12Zm0 2c-4.18 0-7.5 2.14-7.5 4.85V21h15v-2.15C19.5 16.14 16.18 14 12 14Z"
      />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22a2.2 2.2 0 0 0 2.18-2h-4.36A2.2 2.2 0 0 0 12 22Zm7-5-1.65-2.1V10a5.35 5.35 0 0 0-4.1-5.2V4a1.25 1.25 0 0 0-2.5 0v.8A5.35 5.35 0 0 0 6.65 10v4.9L5 17v1h14v-1Z"
      />
    </svg>
  );
}

export function initials(value: string) {
  return value.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
}
