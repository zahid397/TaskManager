/**
 * Small, dependency-free date helpers. Deliberately not pulling in
 * date-fns/dayjs for two formatting functions — keeps the dependency list
 * (and thus the native install surface) smaller, which matters more in a
 * React Native project than it would in a web one.
 */

/** "2 minutes ago", "Just now", "3 hours ago", "5 days ago" */
export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) {
    return 'Never';
  }

  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) {
    return 'Never';
  }

  const diffMs = Date.now() - then;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

/** "Jul 22, 2026" - used for due dates in list/detail views. */
export function formatDate(isoString: string | null): string {
  if (!isoString) {
    return 'No due date';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return 'No due date';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Jul 22, 2026, 10:30 AM" - used for createdAt/updatedAt in detail view. */
export function formatDateTime(isoString: string | null): string {
  if (!isoString) {
    return '—';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
