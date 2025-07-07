// @ts-nocheck
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { OrbitView } from '@deck.gl/core';

export class DeckGLRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.deckInstance = null;
    this.layers = [];
    this.viewState = options.viewState || this.getDefaultViewState();
    this.coordinateSystem = options.coordinateSystem || 'CARTESIAN';
  }

  initialize() {
    const views = this.coordinateSystem === 'CARTESIAN'
      ? [new OrbitView({})]
      : [];

    this.deckInstance = new Deck({
      parent: this.container,
      views,
      initialViewState: this.viewState,
      controller: true,
      layers: this.layers
    });
    return this.deckInstance;
  }

  addLayer(markSpec, data) {
    const cfg = markSpec.props;
    let layer;
    switch (markSpec.layerType) {
      case 'ScatterplotLayer':
        layer = new ScatterplotLayer({
          ...cfg,
          data: data || cfg.data
        });
        break;
      default:
        throw new Error(`Unsupported layer type: ${markSpec.layerType}`);
    }
    const idx = this.layers.findIndex(l => l.id === layer.id);
    if (idx >= 0) this.layers[idx] = layer; else this.layers.push(layer);
    this.updateLayers();
    return layer;
  }

  updateLayers() {
    if (this.deckInstance) {
      this.deckInstance.setProps({ layers: [...this.layers] });
    }
  }

  setViewState(v) {
    this.viewState = v;
    if (this.deckInstance) {
      this.deckInstance.setProps({ initialViewState: v });
    }
  }

  getDefaultViewState() {
    return this.coordinateSystem === 'CARTESIAN'
      ? { target: [0,0,0], zoom: 5, pitch: 0, bearing: 0 }
      : { longitude: 0, latitude: 0, zoom: 2, pitch:0, bearing:0 };
  }

  destroy() {
    if (this.deckInstance) {
      this.deckInstance.finalize();
      this.deckInstance = null;
    }
    this.layers = [];
  }
}
