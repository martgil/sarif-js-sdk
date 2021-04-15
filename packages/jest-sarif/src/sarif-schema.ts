import fetch from 'sync-fetch';
import { SchemaOptions } from './types';

// While this seems overkill for a single item, ultimately this is how I see us supporting
// multiple versions of the SARIF schema. We'd ideally provide a version to load, which would
// be included in this map.
const schemaCache = new Map<string, object>();
const schemaUri = new Map<string, string>([
  ['sarif', 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json'],
]);

export function getSchema(options: SchemaOptions) {
  if (options.schemaName) {
    const schemaName = options.schemaName;
    const uri = schemaUri.get(schemaName);

    if (!schemaCache.has(schemaName) && uri) {
      const schema = fetch(uri).json();

      schemaCache.set(schemaName, schema);
    }

    return schemaCache.get(schemaName)!;
  }

  if (options.definitionName) {
    return getFragmentSchema(options.definitionName);
  }

  throw new Error('You must provide either a schemaName or definitionName in the schema options');
}

function getFragmentSchema(definitionName: string) {
  return JSON.parse(`{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "Static Analysis Results Format (SARIF) Version 2.1.0-rtm.5 ${definitionName} fragment",
    "id": "https://sarif/${definitionName}-fragment.json",
    "description": "A dynamic fragment of a SARIF schema.",
    "allOf": [
      {
        "$ref": "https://raw.githubusercontent.com/schemastore/schemastore/master/src/schemas/json/sarif-2.1.0-rtm.5.json#/definitions/${definitionName}"
      }
    ]
  }`);
}