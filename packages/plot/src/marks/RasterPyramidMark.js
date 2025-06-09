import { RasterTileMark } from './RasterTileMark.js';
import { extentX, extentY } from './util/extent.js';

export class RasterPyramidMark extends RasterTileMark {
  constructor(source, options = {}) {
    const { levels = [1, 2, 4, 8], pixelSize = 1, ...rest } = options;
    super(source, { pixelSize, ...rest });
    this.basePixelSize = pixelSize;
    this.levels = levels;
    this._levelIndex = 0;
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
    this._levelIndex = level;
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
