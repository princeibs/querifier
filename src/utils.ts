import showdown from "showdown";

export function processMd(html) {
  const converter = new showdown.Converter();
  return converter.makeHtml(html);
}

export function extractBracesContent(input: string): string | null {
  const startIndex = input.indexOf("{");
  const endIndex = input.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return null; // Return null if there are no valid braces or if the positions are invalid
  }

  return input.substring(startIndex, endIndex + 1);
}
