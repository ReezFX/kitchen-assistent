/**
 * Utility function to conditionally join class names
 * @param  {...string} classes - Class names to be conditionally joined
 * @returns {string} - Joined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
} 