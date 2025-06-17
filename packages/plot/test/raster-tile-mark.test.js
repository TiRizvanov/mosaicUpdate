import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { RasterTileMark } from '../src/marks/RasterTileMark.js';
import { Plot } from '../src/plot.js';
import { coordinator, Coordinator } from '@uwdata/mosaic-core';

function fakeTable() {
  return {
    numRows: 0,
    getChild() {
      return { toArray: () => [] };
    }
  };
}

describe('RasterTileMark', () => {
  let dom;
  let prev;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body></body>`, { pretendToBeVisual: true });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.requestAnimationFrame = window.requestAnimationFrame;

    prev = coordinator();
    coordinator({
      query: async () => fakeTable(),
      prefetch: async () => null,
      cancel: () => {}
    });
  });

  afterEach(() => {
    delete globalThis.requestAnimationFrame;
    delete globalThis.document;
    delete globalThis.window;
    coordinator(prev);
  });

  it('returns a single density grid', async () => {
    const plot = new Plot();
    plot.setAttribute('xDomain', [0, 1]);
    plot.setAttribute('yDomain', [0, 1]);

    const mark = new RasterTileMark({ table: 't' }, { x: 'x', y: 'y' });
    mark.convolve = () => mark; // skip rasterization
    mark.update = () => {}; // skip plot update

    plot.addMark(mark);
    await mark.requestTiles();

    expect(mark.grids0.numRows).toBe(1);
  });
});
