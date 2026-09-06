import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

/** Opens external sites (bookings, restaurants, activities…) in a new tab. */
export default function ExternalLink({ href, children, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-light hover:underline underline-offset-2 ${className}`}
    >
      {children}
      <ExternalLinkIcon size={13} aria-hidden="true" />
    </a>
  );
}