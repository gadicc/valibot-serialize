import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "../types.ts";

export function isSerializedSchema(value: unknown): value is SerializedSchema {
  if (!value || typeof value !== "object") return false;
  const vObj = value as Record<string, unknown>;
  if (vObj.kind !== "schema") return false;
  if (vObj.vendor !== "valibot") return false;
  if (vObj.version !== 1) return false;
  if (vObj.format !== FORMAT_VERSION) return false;
  const node = vObj.node as SchemaNode | undefined;
  return isSchemaNode(node);
}

function isSchemaNode(node: unknown): node is SchemaNode {
  if (!node || typeof node !== "object") return false;
  const t = (node as { type?: string }).type;
  switch (t) {
    case "string": {
      const n = node as {
        minLength?: unknown;
        maxLength?: unknown;
        length?: unknown;
        pattern?: unknown;
        patternFlags?: unknown;
        email?: unknown;
        rfcEmail?: unknown;
        url?: unknown;
        uuid?: unknown;
        ip?: unknown;
        ipv4?: unknown;
        ipv6?: unknown;
        hexColor?: unknown;
        slug?: unknown;
        creditCard?: unknown;
        imei?: unknown;
        mac?: unknown;
        mac48?: unknown;
        mac64?: unknown;
        base64?: unknown;
        ulid?: unknown;
        nanoid?: unknown;
        cuid2?: unknown;
        isoDate?: unknown;
        isoDateTime?: unknown;
        isoTime?: unknown;
        isoTimeSecond?: unknown;
        isoTimestamp?: unknown;
        isoWeek?: unknown;
        digits?: unknown;
        emoji?: unknown;
        hexadecimal?: unknown;
        minGraphemes?: unknown;
        maxGraphemes?: unknown;
        startsWith?: unknown;
        endsWith?: unknown;
        transforms?: unknown;
      };
      if (n.minLength !== undefined && typeof n.minLength !== "number") {
        return false;
      }
      if (n.maxLength !== undefined && typeof n.maxLength !== "number") {
        return false;
      }
      if (n.length !== undefined && typeof n.length !== "number") return false;
      if (n.pattern !== undefined && typeof n.pattern !== "string") {
        return false;
      }
      if (n.patternFlags !== undefined && typeof n.patternFlags !== "string") {
        return false;
      }
      if (n.email !== undefined && n.email !== true) return false;
      if (n.rfcEmail !== undefined && n.rfcEmail !== true) return false;
      if (n.url !== undefined && n.url !== true) return false;
      if (n.uuid !== undefined && n.uuid !== true) return false;
      if (n.ip !== undefined && n.ip !== true) return false;
      if (n.ipv4 !== undefined && n.ipv4 !== true) return false;
      if (n.ipv6 !== undefined && n.ipv6 !== true) return false;
      if (n.hexColor !== undefined && n.hexColor !== true) return false;
      if (n.slug !== undefined && n.slug !== true) return false;
      if (
        (n as { creditCard?: unknown }).creditCard !== undefined &&
        (n as { creditCard?: unknown }).creditCard !== true
      ) return false;
      if (
        (n as { imei?: unknown }).imei !== undefined &&
        (n as { imei?: unknown }).imei !== true
      ) return false;
      if (
        (n as { mac?: unknown }).mac !== undefined &&
        (n as { mac?: unknown }).mac !== true
      ) return false;
      if (
        (n as { mac48?: unknown }).mac48 !== undefined &&
        (n as { mac48?: unknown }).mac48 !== true
      ) return false;
      if (
        (n as { mac64?: unknown }).mac64 !== undefined &&
        (n as { mac64?: unknown }).mac64 !== true
      ) return false;
      if (
        (n as { base64?: unknown }).base64 !== undefined &&
        (n as { base64?: unknown }).base64 !== true
      ) return false;
      if (n.ulid !== undefined && n.ulid !== true) return false;
      if (n.nanoid !== undefined && n.nanoid !== true) return false;
      if (n.cuid2 !== undefined && n.cuid2 !== true) return false;
      if (n.isoDate !== undefined && n.isoDate !== true) return false;
      if (n.isoDateTime !== undefined && n.isoDateTime !== true) return false;
      if (n.isoTime !== undefined && n.isoTime !== true) return false;
      if (n.isoTimeSecond !== undefined && n.isoTimeSecond !== true) {
        return false;
      }
      if (n.isoTimestamp !== undefined && n.isoTimestamp !== true) return false;
      if (n.isoWeek !== undefined && n.isoWeek !== true) return false;
      if (n.digits !== undefined && n.digits !== true) return false;
      if (n.emoji !== undefined && n.emoji !== true) return false;
      if (n.hexadecimal !== undefined && n.hexadecimal !== true) return false;
      if (n.minGraphemes !== undefined && typeof n.minGraphemes !== "number") {
        return false;
      }
      if (n.maxGraphemes !== undefined && typeof n.maxGraphemes !== "number") {
        return false;
      }
      if (
        (n as { minWords?: unknown }).minWords !== undefined &&
        typeof (n as { minWords?: unknown }).minWords !== "number"
      ) return false;
      if (
        (n as { maxWords?: unknown }).maxWords !== undefined &&
        typeof (n as { maxWords?: unknown }).maxWords !== "number"
      ) return false;
      if (n.startsWith !== undefined && typeof n.startsWith !== "string") {
        return false;
      }
      if (n.endsWith !== undefined && typeof n.endsWith !== "string") {
        return false;
      }
      if (n.transforms !== undefined) {
        if (!Array.isArray(n.transforms)) return false;
        const allowed = new Set([
          "trim",
          "trimStart",
          "trimEnd",
          "toUpperCase",
          "toLowerCase",
          "normalize",
        ]);
        for (const t of n.transforms) {
          if (typeof t !== "string" || !allowed.has(t)) return false;
        }
      }
      return true;
    }
    case "file": {
      const n = node as {
        minSize?: unknown;
        maxSize?: unknown;
        mimeTypes?: unknown;
      };
      if (n.minSize !== undefined && typeof n.minSize !== "number") {
        return false;
      }
      if (n.maxSize !== undefined && typeof n.maxSize !== "number") {
        return false;
      }
      if (n.mimeTypes !== undefined) {
        if (
          !Array.isArray(n.mimeTypes) ||
          (n.mimeTypes as unknown[]).some((x) => typeof x !== "string")
        ) return false;
      }
      return true;
    }
    case "blob": {
      const n = node as {
        minSize?: unknown;
        maxSize?: unknown;
        mimeTypes?: unknown;
      };
      if (n.minSize !== undefined && typeof n.minSize !== "number") {
        return false;
      }
      if (n.maxSize !== undefined && typeof n.maxSize !== "number") {
        return false;
      }
      if (n.mimeTypes !== undefined) {
        if (
          !Array.isArray(n.mimeTypes) ||
          (n.mimeTypes as unknown[]).some((x) => typeof x !== "string")
        ) return false;
      }
      return true;
    }
    case "number": {
      const n = node as {
        min?: unknown;
        max?: unknown;
        gt?: unknown;
        lt?: unknown;
        integer?: unknown;
        safeInteger?: unknown;
        multipleOf?: unknown;
        finite?: unknown;
      };
      if (n.min !== undefined && typeof n.min !== "number") return false;
      if (n.max !== undefined && typeof n.max !== "number") return false;
      if (n.gt !== undefined && typeof n.gt !== "number") return false;
      if (n.lt !== undefined && typeof n.lt !== "number") return false;
      if (n.integer !== undefined && n.integer !== true) return false;
      if (n.safeInteger !== undefined && n.safeInteger !== true) return false;
      if (n.multipleOf !== undefined && typeof n.multipleOf !== "number") {
        return false;
      }
      if (n.finite !== undefined && n.finite !== true) return false;
      return true;
    }
    case "boolean":
      return true;
    case "date":
      return true;
    case "literal": {
      const value = (node as { value?: unknown }).value;
      const vt = typeof value;
      return vt === "string" || vt === "number" || vt === "boolean" ||
        value === null;
    }
    case "array": {
      const n = node as {
        item?: unknown;
        minLength?: unknown;
        maxLength?: unknown;
        length?: unknown;
      };
      if (!isSchemaNode(n.item)) return false;
      if (n.minLength !== undefined && typeof n.minLength !== "number") {
        return false;
      }
      if (n.maxLength !== undefined && typeof n.maxLength !== "number") {
        return false;
      }
      if (n.length !== undefined && typeof n.length !== "number") return false;
      return true;
    }
    case "object": {
      const entries = (node as { entries?: unknown }).entries;
      if (!entries || typeof entries !== "object") return false;
      const opt = (node as { optionalKeys?: unknown }).optionalKeys;
      if (opt !== undefined) {
        if (!Array.isArray(opt) || opt.some((k) => typeof k !== "string")) {
          return false;
        }
      }
      const policy = (node as { policy?: unknown }).policy;
      if (policy !== undefined && policy !== "loose" && policy !== "strict") {
        return false;
      }
      const rest = (node as { rest?: unknown }).rest;
      if (rest !== undefined && !isSchemaNode(rest)) return false;
      const minE = (node as { minEntries?: unknown }).minEntries;
      if (minE !== undefined && typeof minE !== "number") return false;
      const maxE = (node as { maxEntries?: unknown }).maxEntries;
      if (maxE !== undefined && typeof maxE !== "number") return false;
      return true;
    }
    case "optional":
      return isSchemaNode((node as { base?: unknown }).base);
    case "nullable":
      return isSchemaNode((node as { base?: unknown }).base);
    case "nullish":
      return isSchemaNode((node as { base?: unknown }).base);
    case "union": {
      const options = (node as { options?: unknown }).options;
      return Array.isArray(options) && options.every((n) => isSchemaNode(n));
    }
    case "tuple": {
      const items = (node as { items?: unknown }).items;
      return Array.isArray(items) && items.every((n) => isSchemaNode(n));
    }
    case "record":
      return (
        isSchemaNode((node as { key?: unknown }).key) &&
        isSchemaNode((node as { value?: unknown }).value)
      );
    case "enum": {
      const values = (node as { values?: unknown }).values;
      if (!Array.isArray(values)) return false;
      for (const v of values) {
        const t = typeof v;
        if (
          !(t === "string" || t === "number" || t === "boolean") && v !== null
        ) return false;
      }
      return true;
    }
    case "picklist": {
      const values = (node as { values?: unknown }).values;
      return Array.isArray(values) &&
        values.every((v) => typeof v === "string");
    }
    case "set": {
      const n = node as {
        value?: unknown;
        minSize?: unknown;
        maxSize?: unknown;
      };
      if (!isSchemaNode(n.value)) return false;
      if (n.minSize !== undefined && typeof n.minSize !== "number") {
        return false;
      }
      if (n.maxSize !== undefined && typeof n.maxSize !== "number") {
        return false;
      }
      return true;
    }
    case "map": {
      const n = node as {
        key?: unknown;
        value?: unknown;
        minSize?: unknown;
        maxSize?: unknown;
      };
      if (!isSchemaNode(n.key) || !isSchemaNode(n.value)) return false;
      if (n.minSize !== undefined && typeof n.minSize !== "number") {
        return false;
      }
      if (n.maxSize !== undefined && typeof n.maxSize !== "number") {
        return false;
      }
      return true;
    }
    default:
      return false;
  }
}
