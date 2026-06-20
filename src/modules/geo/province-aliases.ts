// Patrones para normalizar nombres de provincias argentinas.
// PROVINCE_ALIAS_MATCH: usar con .test() contra strings ya normalizados (sin tildes, lowercase).
// PROVINCE_ALIAS_REPLACE: usar con .replace() en strings originales.

const ALIAS_ENTRIES: Array<[string, string]> = [
  ['bsas|buenos aires|b a|baires', 'Buenos Aires'],
  ['caba|ciudad autonoma', 'Ciudad Autónoma de Buenos Aires'],
  ['cba|cordoba', 'Córdoba'],
  ['sf|santa fe|sta fe', 'Santa Fe'],
  ['er|entre rios', 'Entre Ríos'],
  ['la pampa|lp', 'La Pampa'],
  ['mza|mendoza', 'Mendoza'],
  ['misiones', 'Misiones'],
  ['rio negro|rionegro', 'Río Negro'],
  ['tucuman|tuc', 'Tucumán'],
  ['san luis', 'San Luis'],
  ['san juan', 'San Juan'],
  ['chaco', 'Chaco'],
  ['chubut', 'Chubut'],
  ['corrientes', 'Corrientes'],
  ['formosa', 'Formosa'],
  ['jujuy', 'Jujuy'],
  ['la rioja', 'La Rioja'],
  ['neuquen', 'Neuquén'],
  ['salta', 'Salta'],
  ['santa cruz', 'Santa Cruz'],
  ['santiago del estero', 'Santiago del Estero'],
  ['tierra del fuego', 'Tierra del Fuego'],
  ['catamarca', 'Catamarca'],
];

export const PROVINCE_ALIAS_MATCH: Array<[RegExp, string]> = ALIAS_ENTRIES.map(
  ([p, name]) => [new RegExp(`\\b(${p})\\b`, 'i'), name],
);

export const PROVINCE_ALIAS_REPLACE: Array<[RegExp, string]> = ALIAS_ENTRIES.map(
  ([p, name]) => [new RegExp(`\\b(${p})\\b`, 'gi'), name],
);
