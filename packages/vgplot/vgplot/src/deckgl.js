// @ts-nocheck
export function initializeDeckGL() {
  if (typeof deck === 'undefined') {
    throw new Error('deck.gl not loaded. Please include deck.gl in your HTML.');
  }
  return true;
}
