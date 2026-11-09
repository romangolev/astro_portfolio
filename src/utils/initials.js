// Two-letter monogram for cards without a cover image. Splits camelCase and
// non-alphanumeric boundaries, then uses the first letter of the first two
// tokens (or the first two characters of a single token).
export function getInitials(title) {
  const tokens = String(title ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

  if (tokens.length === 0) return '';
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}
