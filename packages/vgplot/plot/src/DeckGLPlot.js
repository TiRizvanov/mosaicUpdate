// @ts-nocheck
import { Plot } from './plot.js';
import { DeckGLRenderer } from './DeckGLRenderer.js';

export class DeckGLPlot extends Plot {
  constructor(marks = [], options = {}) {
    super(null);
    this.marks = marks;
    this.renderer = null;
    this.coordinateSystem = options.coordinateSystem || 'CARTESIAN';
    this.options = options;
  }

  async render(coordinator, opts = {}) {
    const { width = 600, height = 400 } = opts;
    const container = this.element;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.position = 'relative';
    this.renderer = new DeckGLRenderer(container, {
      coordinateSystem: this.coordinateSystem
    });
    this.renderer.initialize();

    for (const mark of this.marks) {
      if (mark.type === 'deckgl-scatterplot') {
        await this.renderDeckMark(mark, coordinator);
      }
    }
    return;
  }

  async renderDeckMark(mark, coordinator) {
    const q = mark.query();
    const data = await coordinator.query(q, { type: 'arrow' });
    const spec = mark.plotSpecs();
    let points;
    if (data && typeof data.toArray === 'function') {
      points = mark.convertArrowToPoints(data);
    } else {
      points = Array.isArray(data) ? data : [];
    }
    this.renderer.addLayer(spec, points);
    mark.addEventListener('data', e => {
      const upd = mark.convertArrowToPoints(e.detail);
      this.renderer.addLayer(spec, upd);
    });
  }

  async update(mark) {
    if (mark.type === 'deckgl-scatterplot' && mark.processedData) {
      const spec = mark.plotSpecs();
      this.renderer.addLayer(spec, mark.processedData);
    }
    return Promise.resolve();
  }

  destroy() {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
  }
}
