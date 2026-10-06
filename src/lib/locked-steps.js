// Template §9.5: only the NEXT locked step shows as a card with its unlock hint; every later locked
// step collapses to a title row. "Next" is decided here, across the whole flow in DOM order, and
// skipping hidden steps. A CSS sibling rule (`:not(locked) + locked`, `locked:first-child`) cannot do
// this: hidden steps and the separate Contact & Shipping / Payment block both break it.
export function markNextLockedStep(scope = document) {
  let found = false;
  for (const step of scope.querySelectorAll('.configuration-step')) {
    const next = !found && step.dataset.state === 'locked' && !step.closest('[hidden]');
    if (next) found = true;
    step.toggleAttribute('data-next-locked', next);
  }
}
