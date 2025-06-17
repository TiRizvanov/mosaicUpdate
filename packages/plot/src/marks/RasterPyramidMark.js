import { RasterTileMark } from './RasterTileMark.js';
import { extentX, extentY } from './util/extent.js';

export class RasterPyramidMark extends RasterTileMark {
  constructor(source, options = {}) {
    const { levels, pixelSize = 1, ...rest } = options;
    super(source, { pixelSize, ...rest });
    this.basePixelSize = pixelSize;
    // if levels are not specified, generate 100 increasing levels
    this.levels = levels ?? Array.from({ length: 100 }, (_, i) => i + 1);
    this._levelIndex = -1;
    this.pixelSizeCurrent = pixelSize;
    this._initExtent = null;
  }

  setPlot(plot, index) {
    super.setPlot(plot, index);
    // store the full data extent for zoom calculations
    const filter = [];
    const [x0, x1] = extentX(this, filter);
    const [y0, y1] = extentY(this, filter);
    this._initExtent = [[x0, x1], [y0, y1]];
  }

  currentLevel(xspan, yspan) {
    const [ [x0, x1], [y0, y1] ] = this._initExtent || [[0,1],[0,1]];
    const fullX = x1 - x0;
    const fullY = y1 - y0;
    const zoom = Math.max(fullX / xspan, fullY / yspan);
    let level = 0;
    for (let i = 0; i < this.levels.length; ++i) {
      if (zoom >= this.levels[i]) level = i;
    }
    return level;
  }

  async requestTiles() {
    const [x0, x1] = extentX(this, this._filter);
    const [y0, y1] = extentY(this, this._filter);
    const level = this.currentLevel(x1 - x0, y1 - y0);
    if (level !== this._levelIndex) {
      this._levelIndex = level;
      // clear cached tiles when resolution level changes
      this.tileCache.clear();
      this._precomputed = false;
    }
    this.pixelSizeCurrent = this.basePixelSize / this.levels[level];
    this.pixelSize = this.pixelSizeCurrent;
    return super.requestTiles();
  }

  binDimensions() {
    const ps = this.pixelSizeCurrent || this.basePixelSize;
    const { plot, width, height } = this;
    return [
      width ?? Math.round(plot.innerWidth() / ps),
      height ?? Math.round(plot.innerHeight() / ps)
    ];
  }
}
