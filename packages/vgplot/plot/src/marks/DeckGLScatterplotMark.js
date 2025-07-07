// @ts-nocheck
import { Mark } from './Mark.js';
import { sql } from '@uwdata/mosaic-sql';

export class DeckGLScatterplotMark extends Mark {
  constructor(data, options = {}) {
    super('deckgl-scatterplot', data, options);
    this.coordinateSystem = options.coordinateSystem || 'CARTESIAN';
    this.radiusScale = options.radiusScale ?? 1;
    this.radiusMinPixels = options.radiusMinPixels ?? 1;
    this.radiusMaxPixels = options.radiusMaxPixels ?? 100;
    this.opacity = options.opacity ?? 0.8;
  }

  query(filter = []) {
    const { channels, source } = this;
    const x = channels.find(c => c.channel === 'x')?.field;
    const y = channels.find(c => c.channel === 'y')?.field;
    const color = channels.find(c => c.channel === 'color')?.field;
    const radius = channels.find(c => c.channel === 'radius')?.field
      || channels.find(c => c.channel === 'size')?.field;

    if (!x || !y) throw new Error('DeckGL scatterplot requires x and y channels');

    const columns = [
      sql`ST_Point2D(${x}, ${y}) AS geom`,
      sql`${x} AS x`,
      sql`${y} AS y`
    ];
    if (color) columns.push(sql`${color} AS color`);
    if (radius) columns.push(sql`${radius} AS radius`);

    for (const { channel, field } of channels) {
      if (!['x','y','color','radius','size'].includes(channel) && field) {
        columns.push(sql`${field} AS ${channel}`);
      }
    }

    const query = sql`SELECT ${columns} FROM ${source.table}`;
    if (filter.length) query.where(...filter);
    return query;
  }

  plotSpecs() {
    return {
      type: 'deckgl-layer',
      layerType: 'ScatterplotLayer',
      props: {
        id: `deckgl-scatterplot-${this.id || Math.random()}`,
        coordinateSystem: this.coordinateSystem,
        radiusScale: this.radiusScale,
        radiusMinPixels: this.radiusMinPixels,
        radiusMaxPixels: this.radiusMaxPixels,
        opacity: this.opacity,
        pickable: true,
        getPosition: this.getPositionAccessor(),
        getFillColor: this.getColorAccessor(),
        getRadius: this.getRadiusAccessor(),
        data: []
      }
    };
  }

  getPositionAccessor() {
    return d => [d.x, d.y];
  }

  getColorAccessor() {
    return d => d.color ?? [255,140,0,255];
  }

  getRadiusAccessor() {
    return d => d.radius ?? 5;
  }

  async update(data) {
    await super.update();
    if (data && typeof data.toArray === 'function') {
      this.processedData = this.convertArrowToPoints(data);
    } else if (Array.isArray(data)) {
      this.processedData = data;
    }
    this.requestUpdate();
  }

  convertArrowToPoints(table) {
    const points = [];
    const n = table.numRows;
    for (let i=0; i<n; ++i) {
      const p = { x: table.getChild('x')?.get(i) ?? 0,
                  y: table.getChild('y')?.get(i) ?? 0 };
      const c = table.getChild('color');
      if (c) p.color = c.get(i);
      const r = table.getChild('radius');
      if (r) p.radius = r.get(i);
      points.push(p);
    }
    return points;
  }
}
