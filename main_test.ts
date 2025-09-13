import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { deserialize, serialize } from "./main.ts";

describe("serialize", () => {
  it("string", () => {
    const string = v.string();
    const serialized = serialize(string);
    expect(serialized).toMatchObject({
      kind: "schema",
      type: "string",
      expects: "string",
      async: false,
      "~standard": { version: 1, vendor: "valibot" },
    });
  });
});

describe("deserialize", () => {
  it("string", () => {
    const serialized = {
      kind: "schema",
      type: "string",
      expects: "string",
      async: false,
      "~standard": { version: 1, vendor: "valibot" },
    };
    const schema = deserialize(serialized);
    expect(schema.reference).toBe(v.string);
  });
});

describe("serialize + deserialize", () => {
  it("string", () => {
    const string = v.string();
    const serialized = serialize(string);
    const deserialized = deserialize(serialized);
    expect(JSON.parse(JSON.stringify(deserialized))).toMatchObject(
      JSON.parse(JSON.stringify(string)),
    );
  });
});
