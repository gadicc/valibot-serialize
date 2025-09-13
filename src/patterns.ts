// Centralized pattern strings used in JSON Schema conversion and detection.
// Strings are anchored and meant to be used as JSON Schema `pattern` directly.

export const patterns = {
  hexColor: "^#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$",
  slug: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  digits: "^[0-9]+$",
  hexadecimal: "^[0-9A-Fa-f]+$",
  mac: "^(?:[0-9A-Fa-f]{2}([:\\-]))(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}$",
  mac48: "^(?:[0-9A-Fa-f]{2}([:\\-]))(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}$",
  mac64: "^(?:[0-9A-Fa-f]{2}([:\\-]))(?:[0-9A-Fa-f]{2}\\1){6}[0-9A-Fa-f]{2}$",
  base64: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
  ulid: "^[0-9A-HJKMNP-TV-Z]{26}$",
  nanoid: "^[A-Za-z0-9_-]+$",
  cuid2: "^[a-z0-9]{25}$",
  isoDate: "^\\d{4}-\\d{2}-\\d{2}$",
  isoTime: "^\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,9})?)?(Z|[+\\-]\\d{2}:?\\d{2})?$",
  isoTimeSecond:
    "^\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,9})?(Z|[+\\-]\\d{2}:?\\d{2})?$",
  isoDateTime:
    "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,9})?)?(Z|[+\\-]\\d{2}:?\\d{2})?$",
  isoTimestamp:
    "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,9})?)?(Z|[+\\-]\\d{2}:?\\d{2})?$",
  isoWeek: "^\\d{4}-W\\d{2}(-\\d)?$",
} as const;

export const detect = {
  hexColor: new RegExp(patterns.hexColor),
  slug: new RegExp(patterns.slug),
  digits: new RegExp(patterns.digits),
  hexadecimal: new RegExp(patterns.hexadecimal),
  mac: new RegExp(patterns.mac),
  mac48: new RegExp(patterns.mac48),
  mac64: new RegExp(patterns.mac64),
  base64: new RegExp(patterns.base64),
  ulid: new RegExp(patterns.ulid),
  nanoid: new RegExp(patterns.nanoid),
  cuid2: new RegExp(patterns.cuid2),
  isoDate: new RegExp(patterns.isoDate),
  isoTime: new RegExp(patterns.isoTime),
  isoTimeSecond: new RegExp(patterns.isoTimeSecond),
  isoDateTime: new RegExp(patterns.isoDateTime),
  isoTimestamp: new RegExp(patterns.isoTimestamp),
  isoWeek: new RegExp(patterns.isoWeek),
} as const;
