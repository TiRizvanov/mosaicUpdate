import { ChannelValueSpec, MarkData, MarkOptions } from './Marks.js';

export interface DeckGLScatterplotOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  color?: ChannelValueSpec;
  radius?: ChannelValueSpec;
  size?: ChannelValueSpec;
  opacity?: number;
  coordinateSystem?: 'CARTESIAN' | 'LNGLAT';
  radiusScale?: number;
  radiusMinPixels?: number;
  radiusMaxPixels?: number;
  pickable?: boolean;
  layerProps?: Record<string, any>;
}

export interface DeckGLScatterplot extends MarkData, DeckGLScatterplotOptions {
  mark: 'deckgl-scatterplot';
}
