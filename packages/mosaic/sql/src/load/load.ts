import { createTable, CreateTableOptions } from './create.js';
import { sqlFrom } from './sql-from.js';

type Options =
  & { select?: string[]; }
  & CreateTableOptions
  & Record<string, unknown>;

export function load(
  method: string,
  tableName: string,
  fileName: string,
  options: Options = {},
  defaults: Record<string, unknown> = {}
) {
  const { select = ['*'], where, view, temp, replace, ...file } = options;
  const params = parameters({ ...defaults, ...file });
  const read = `${method}('${fileName}'${params ? ', ' + params : ''})`;
  const filter = where ? ` WHERE ${where}` : '';
  const query = `SELECT ${select.join(', ')} FROM ${read}${filter}`;
  return createTable(tableName, query, { view, temp, replace });
}

export function loadCSV(tableName: string, fileName: string, options: Options) {
  return load('read_csv', tableName, fileName, options, { auto_detect: true, sample_size: -1 });
}

export function loadJSON(tableName: string, fileName: string, options: Options) {
  return load('read_json', tableName, fileName, options, { auto_detect: true, format: 'auto' });
}

export function loadParquet(tableName: string, fileName: string, options: Options) {
  return load('read_parquet', tableName, fileName, options);
}

/**
 * Load geometry data within a spatial file format.
 * This method requires that the DuckDB spatial extension is loaded.
 * Supports GeoJSON, TopoJSON, and other common spatial formats.
 * For TopoJSON, wet the layer option to indicate the feature to extract.
 */
export function loadSpatial(tableName: string, fileName: string, options: Options = {}) {
  // nested options map to the open_options argument of st_read
  const { options: opt, ...rest } = options;
  if (opt) {
    // TODO: check correct syntax for open_options
    const open = Array.isArray(opt) ? opt.join(', ')
      : typeof opt === 'string' ? opt
      : Object.entries(opt)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ');
    Object.assign(rest, { open_options: open.toUpperCase() });
  }
  // TODO: handle box_2d for spatial_filter_box option
  // TODO: handle wkb_blob for spatial_filter option
  return load('st_read', tableName, fileName, rest);
}

export function loadObjects(
  tableName: string,
  data: (Record<string,unknown>)[],
  options: Options = {}
) {
  const { select = ['*'], ...opt } = options;
  const values = sqlFrom(data);
  const query = select.length === 1 && select[0] === '*'
    ? values
    : `SELECT ${select} FROM ${values}`;
  return createTable(tableName, query, opt);
}

function parameters(options: Record<string, unknown>) {
  return Object.entries(options)
    .map(([key, value]) => `${key}=${toDuckDBValue(value)}`)
    .join(', ');
}

function toDuckDBValue(value: unknown): string {
  switch (typeof value) {
    case 'boolean':
      return String(value);
    case 'string':
      return `'${value}'`;
    case 'undefined':
    case 'object':
      if (value == null) {
        return 'NULL';
      } else if (Array.isArray(value)) {
        return '[' + value.map(v => toDuckDBValue(v)).join(', ') + ']';
      } else {
        return '{'
          + Object.entries(value)
              .map(([k, v]) => `'${k}': ${toDuckDBValue(v)}`)
              .join(', ')
          + '}';
      }
    default:
      return `${value}`;
  }
}
