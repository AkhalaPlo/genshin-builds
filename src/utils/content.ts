import fs from 'fs';
import path from 'path';
import { parsePublicCharacterSlug } from './character-slugs';

/**
 * Formats a JSON path for build errors.
 *
 * Uses a repo-relative path when possible so CI logs point to the file without
 * leaking machine-specific absolute paths, and normalizes separators for GitHub.
 *
 * @param filePath JSON file path.
 * @returns Display-ready file path.
 */
function formatFilePath(filePath: string) {
  const absolutePath = path.resolve(filePath);
  const relativePath = path.relative(process.cwd(), absolutePath);
  const displayPath =
    relativePath &&
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath)
      ? relativePath
      : absolutePath;

  return displayPath.split(path.sep).join('/');
}

/**
 * Extracts line and column information from Node's JSON parse error message.
 *
 * Node includes this location in the message text rather than as structured
 * properties, so this returns null when the runtime does not provide it.
 *
 * @param error Error thrown while parsing JSON.
 * @returns Parsed line and column, or null when unavailable.
 */
function getJSONErrorLocation(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  const match = error.message.match(/\(line (\d+) column (\d+)\)/);

  if (!match) {
    return null;
  }

  return {
    line: Number(match[1]),
    column: Number(match[2]),
  };
}

/**
 * Builds a small source excerpt for a JSON parse error.
 *
 * The excerpt includes the failing line and a caret under the reported column.
 *
 * @param source JSON source text.
 * @param error Error thrown while parsing the source.
 * @returns Formatted excerpt, or null when no location can be found.
 */
function getJSONErrorExcerpt(source: string, error: unknown) {
  const location = getJSONErrorLocation(error);

  if (!location) {
    return null;
  }

  const lineText = source.split(/\r?\n/)[location.line - 1];

  if (lineText === undefined) {
    return null;
  }

  const linePrefix = `${location.line} | `;
  const pointerOffset = linePrefix.length + Math.max(location.column - 1, 0);

  return `${linePrefix}${lineText}\n${' '.repeat(pointerOffset)}^`;
}

/**
 * Reads and parses a JSON file with path-aware syntax errors.
 *
 * On invalid JSON, the thrown SyntaxError includes the source file path, the
 * original parser message, and a caret excerpt when the runtime reports a line
 * and column.
 *
 * @param filePath JSON file path.
 * @returns Parsed JSON value.
 */
export function readJSONFile(filePath: string) {
  const source = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');

  try {
    return JSON.parse(source);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    const excerpt = getJSONErrorExcerpt(source, error);
    const parseError = new SyntaxError(
      [
        `Failed to parse JSON file: ${formatFilePath(filePath)}`,
        details,
        excerpt,
      ]
        .filter(Boolean)
        .join('\n'),
    );

    (parseError as SyntaxError & { cause?: unknown }).cause = error;
    throw parseError;
  }
}

/**
 * Returns the localized note for a content item.
 *
 * Supports:
 * - legacy string notes
 * - localized note objects
 *
 * Example:
 * {
 *   note: {
 *     en: "Example note",
 *     fr: "Note d'exemple"
 *   }
 * }
 *
 * Falls back to English if the requested language
 * does not exist.
 *
 * @param item Content item containing a note field.
 * @param lang Current language code.
 * @returns Localized note string or null if no note exists.
 */
export function getLocalizedNote(item: any, lang: string): string | null {
  if (!item?.note) return null;

  if (typeof item.note === 'string') {
    return item.note;
  }

  return item.note[lang] ?? item.note.en ?? null;
}

/**
 * Loads a JSON file from either:
 * - the current build folder
 * - the parent character folder
 *
 * Build-level files override character-level files.
 *
 * Example lookup order:
 * 1. builds/dps/weapons.json
 * 2. character/weapons.json
 *
 * @param buildPath Current build directory path.
 * @param fileName JSON file name.
 * @returns Parsed JSON object or null if the file does not exist.
 */
export function loadJSON(buildPath: string, fileName: string) {
  const buildFile = path.join(buildPath, fileName);
  const charFile = path.join(path.dirname(buildPath), fileName);

  if (fs.existsSync(buildFile)) {
    return readJSONFile(buildFile);
  }

  if (fs.existsSync(charFile)) {
    return readJSONFile(charFile);
  }

  return null;
}

/**
 * Converts a kebab-case string into title case.
 *
 * Example:
 * - "raiden-shogun" -> "Raiden Shogun"
 *
 * @param str Input kebab-case string.
 * @returns Human-readable title string.
 */
export const toTitleCase = (str: string) =>
  str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/**
 * Searches the content directory for a character folder.
 *
 * Traverses:
 * - element folders
 * - rarity folders
 *
 * Example structure:
 * content/electro/5-star/raiden-shogun
 *
 * @param base Base content directory.
 * @param char Character slug.
 * @returns Character path information or null if not found.
 */
export function findCharacterPath(base: string, char: string) {
  const lookup = parsePublicCharacterSlug(char);

  if (lookup.character === 'traveler' && !lookup.element) {
    return null;
  }

  for (const element of fs.readdirSync(base)) {
    if (lookup.element && element !== lookup.element) {
      continue;
    }

    for (const rarity of fs.readdirSync(path.join(base, element))) {
      const candidate = path.join(base, element, rarity, lookup.character);
      const metadataFile = path.join(candidate, 'metadata.json');

      if (fs.existsSync(metadataFile)) {
        return {
          element,
          rarity,
          path: candidate,
        };
      }
    }
  }

  return null;
}
