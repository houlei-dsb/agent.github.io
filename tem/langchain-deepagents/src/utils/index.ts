export function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function truncateText(text: string, maxLength: number = 500): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}