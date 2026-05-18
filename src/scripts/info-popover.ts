const infoPopoverWindow = window as typeof window & {
  __infoPopoversReady?: boolean;
};

if (!infoPopoverWindow.__infoPopoversReady) {
  infoPopoverWindow.__infoPopoversReady = true;

  const VIEWPORT_PADDING = 8;
  const POPOVER_GAP = 8;
  const cardPortals = new WeakMap<
    HTMLElement,
    { card: HTMLElement; marker: Comment }
  >();
  const portaledCards = new WeakMap<HTMLElement, HTMLElement>();
  let ignoreNextClick = false;

  /**
   * Keeps a coordinate inside a min/max viewport range.
   */
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  /**
   * Updates a popover trigger's expanded state.
   */
  const setTriggerExpanded = (popover: HTMLElement, isExpanded: boolean) => {
    popover
      .querySelector<HTMLElement>('.info-popover-trigger')
      ?.setAttribute('aria-expanded', String(isExpanded));
  };

  /**
   * Finds the popover wrapper for an event target.
   */
  const getClosestPopover = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return null;

    const card = target.closest<HTMLElement>('.info-popover-card');
    const portaledPopover = card ? portaledCards.get(card) : null;

    return portaledPopover ?? target.closest<HTMLElement>('.info-popover');
  };

  /**
   * Finds the card for a popover, including cards moved to the document body.
   */
  const getPopoverCard = (popover: HTMLElement) =>
    cardPortals.get(popover)?.card ??
    popover.querySelector<HTMLElement>('.info-popover-card');

  /**
   * Moves an opened popover card to the document body so mobile browsers can
   * hit-test and scroll it independently from the surrounding inline layout.
   */
  const portalPopoverCard = (popover: HTMLElement) => {
    if (cardPortals.has(popover)) return;

    const card = popover.querySelector<HTMLElement>('.info-popover-card');
    if (!card) return;

    const marker = document.createComment('info-popover-card');
    card.before(marker);
    card.classList.add('is-portaled');
    document.body.append(card);
    cardPortals.set(popover, { card, marker });
    portaledCards.set(card, popover);
  };

  /**
   * Restores a portaled card to its original spot in the popover markup.
   */
  const restorePopoverCard = (popover: HTMLElement) => {
    const portal = cardPortals.get(popover);
    if (!portal) return;

    portal.card.classList.remove('is-portaled');
    portal.marker.replaceWith(portal.card);
    cardPortals.delete(popover);
    portaledCards.delete(portal.card);
  };

  /**
   * Checks whether an event happened inside a popover card.
   */
  const isInsidePopoverCard = (target: EventTarget | null) =>
    target instanceof HTMLElement
      ? target.closest<HTMLElement>('.info-popover-card') !== null
      : false;

  /**
   * Handles opening, closing, and outside-tap behavior for popovers.
   */
  const handlePopoverToggle = (event: Event) => {
    const target = event.target as HTMLElement;
    const trigger = target.closest('.info-popover-trigger');
    const card = target.closest('.info-popover-card');

    if (card) {
      return;
    }

    if (!trigger) {
      closeInfoPopovers();
      return;
    }

    event.preventDefault();

    const popover = getClosestPopover(trigger);
    if (!popover) return;

    const isOpen = popover.classList.toggle('is-open');
    setTriggerExpanded(popover, isOpen);
    if (isOpen) {
      portalPopoverCard(popover);
      positionPopoverCard(popover);
    } else {
      restorePopoverCard(popover);
    }
    closeInfoPopovers(popover);
  };

  /**
   * Switches a weapon passive between refinement panels.
   */
  const handleRefinementChange = (event: Event) => {
    const button = (event.target as HTMLElement).closest(
      '.weapon-popover-refinement-button',
    ) as HTMLElement | null;

    if (!button) return;

    event.preventDefault();

    const card = button.closest('.info-popover-card');

    if (!card) return;

    const refinement = button.dataset.refinement;

    if (!refinement) return;

    card
      .querySelectorAll('.weapon-popover-refinement-button')
      .forEach((item) => {
        item.setAttribute('aria-selected', String(item === button));
      });

    card
      .querySelectorAll('.weapon-popover-passive-refinement')
      .forEach((panel) => {
        (panel as HTMLElement).hidden =
          (panel as HTMLElement).dataset.refinementPanel !== refinement;
      });

    const popover = getClosestPopover(button);

    if (popover) {
      positionPopoverCard(popover);
    }
  };

  /**
   * Positions a popover card so it remains fully inside the viewport.
   */
  const positionPopoverCard = (popover: HTMLElement) => {
    const trigger = popover.querySelector<HTMLElement>('.info-popover-trigger');
    const card = getPopoverCard(popover);

    if (!trigger || !card) return;

    const previousDisplay = card.style.display;
    const previousVisibility = card.style.visibility;

    card.style.display = 'block';
    card.style.visibility = 'hidden';

    const triggerRect = trigger.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const maxLeft = window.innerWidth - cardRect.width - VIEWPORT_PADDING;
    const maxTop = window.innerHeight - cardRect.height - VIEWPORT_PADDING;
    const alignedLeft = triggerRect.left;
    const topPlacement = triggerRect.top - cardRect.height - POPOVER_GAP;
    const bottomPlacement = triggerRect.bottom + POPOVER_GAP;
    const hasRoomAbove = topPlacement >= VIEWPORT_PADDING;
    const hasRoomBelow =
      bottomPlacement + cardRect.height <=
      window.innerHeight - VIEWPORT_PADDING;
    const preferredTop =
      hasRoomAbove || !hasRoomBelow ? topPlacement : bottomPlacement;

    card.style.left = `${clamp(alignedLeft, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, maxLeft))}px`;
    card.style.top = `${clamp(preferredTop, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, maxTop))}px`;
    card.style.display = previousDisplay;
    card.style.visibility = previousVisibility;
  };

  /**
   * Repositions every popover that is currently visible or interactive.
   */
  const positionActivePopovers = () => {
    document
      .querySelectorAll<HTMLElement>(
        '.info-popover:hover, .info-popover:focus-within, .info-popover.is-open',
      )
      .forEach(positionPopoverCard);
  };

  /**
   * Closes open popovers except for the one currently being interacted with.
   */
  const closeInfoPopovers = (except?: HTMLElement) => {
    document
      .querySelectorAll<HTMLElement>('.info-popover.is-open')
      .forEach((popover) => {
        if (popover !== except) {
          popover.classList.remove('is-open');
          setTriggerExpanded(popover, false);
          restorePopoverCard(popover);
        }
      });

    document.body.classList.toggle(
      'info-popover-locked',
      document.querySelector('.info-popover.is-open') !== null,
    );
  };

  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;

    handleRefinementChange(event);

    if (!event.defaultPrevented) {
      handlePopoverToggle(event);
    }

    if (event.defaultPrevented) {
      ignoreNextClick = true;
    }
  });

  document.addEventListener('click', (event) => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }

    handlePopoverToggle(event);
  });

  document.addEventListener('pointerover', (event) => {
    const popover = getClosestPopover(event.target);

    if (popover) {
      positionPopoverCard(popover);
    }
  });

  document.addEventListener('focusin', (event) => {
    const popover = getClosestPopover(event.target);

    if (popover && !document.body.classList.contains('info-popover-locked')) {
      positionPopoverCard(popover);
      closeInfoPopovers(popover);
    }
  });

  window.addEventListener('resize', positionActivePopovers);
  window.addEventListener(
    'scroll',
    (event) => {
      if (!isInsidePopoverCard(event.target)) {
        positionActivePopovers();
      }
    },
    true,
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeInfoPopovers();
    }
  });

  document.addEventListener('click', handleRefinementChange);
}
