import { initializeFilterSelects } from './filter-selects';

const filters = document.querySelector<HTMLFormElement>(
  '[data-character-filters]',
);
const cards = Array.from(
  document.querySelectorAll<HTMLElement>('[data-character-card]'),
);
const count = document.querySelector<HTMLElement>('[data-character-count]');
const emptyState = document.querySelector<HTMLElement>(
  '[data-character-empty]',
);

/**
 * Reads one filter control value from the home page form.
 *
 * @param name Form control name.
 * @returns Current control value, or an empty string when missing.
 */
function getFilterValue(name: string) {
  const field = filters?.elements.namedItem(name);

  if (field instanceof HTMLInputElement && field.type === 'checkbox') {
    return field.checked ? field.value : '';
  }

  if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
    return field.value;
  }

  return '';
}

/**
 * Applies all selected filters to the character roster.
 *
 * Cards stay in the DOM for fast filtering; unmatched cards are hidden with the
 * native `hidden` attribute.
 */
function applyFilters() {
  const search = getFilterValue('search').trim().toLowerCase();
  const selectedElement = getFilterValue('element');
  const selectedRarity = getFilterValue('rarity');
  const selectedWeapon = getFilterValue('weapon');
  const selectedUpdated = getFilterValue('updated');

  let visibleCount = 0;

  cards.forEach((card) => {
    // Dataset values are written by the Astro page when rendering each card.
    const matchesSearch =
      !search || card.dataset.name?.toLowerCase().includes(search);
    const matchesElement =
      !selectedElement || card.dataset.element === selectedElement;
    const matchesRarity =
      !selectedRarity || card.dataset.rarity === selectedRarity;
    const matchesWeapon =
      !selectedWeapon || card.dataset.weapon === selectedWeapon;
    const matchesUpdated =
      !selectedUpdated || card.dataset.recentUpdated === 'true';

    const isVisible =
      matchesSearch &&
      matchesElement &&
      matchesRarity &&
      matchesWeapon &&
      matchesUpdated;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (count) {
    count.textContent = `${visibleCount} ${count.dataset.resultsLabel ?? ''}`;
  }

  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
  }
}

// One handler covers selects and the text search input.
filters?.addEventListener('change', applyFilters);
filters?.addEventListener('input', applyFilters);
filters?.addEventListener('submit', (event) => event.preventDefault());

initializeFilterSelects();
applyFilters();

export {};
