/**
 * Formats an array of authors into a prettified string.
 * @param authors - The authors array
 * @returns A prettified string of authors.
 * @example
 *
 * ['Author1', 'Author2'] becomes 'Author1 and Author2'
 * ['Author1', 'Author2', 'Author3'] becomes 'Author1, Author2, and Author3'
 *
 */
export const formatAuthors = (authors: string[]): string => {
  // Ensure we don't have any empty authors
  const authorNames = authors.filter(Boolean)

  if (authorNames.length === 0) return ''
  if (authorNames.length === 1) return authorNames[0]
  if (authorNames.length === 2) return `${authorNames[0]} and ${authorNames[1]}`

  return `${authorNames.slice(0, -1).join(', ')} and ${authorNames[authorNames.length - 1]}`
}
