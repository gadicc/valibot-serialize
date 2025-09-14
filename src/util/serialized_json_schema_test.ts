import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { serializedSchemaJson } from "../../main.ts";

describe("serialized JSON Schema shape", () => {
  it("has properties and $defs", () => {
    expect(typeof serializedSchemaJson.$schema).toBe("string");
    const props = (serializedSchemaJson as Record<string, unknown>)
      .properties as Record<string, unknown>;
    expect(typeof props).toBe("object");
    expect(Object.prototype.hasOwnProperty.call(props, "node")).toBe(true);
    const defs = (serializedSchemaJson as Record<string, unknown>)
      .$defs as Record<string, unknown>;
    expect(typeof defs).toBe("object");
    expect(Object.keys(defs).length).toBeGreaterThan(5);
  });
});
