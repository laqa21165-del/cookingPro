export function countMeaningfulChars(content: string) {
  return content.replace(/\s+/g, '').length;
}
