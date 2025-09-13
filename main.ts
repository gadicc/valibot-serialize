import * as v from "@valibot/valibot";
import { BaseIssue, BaseSchema, StandardProps } from "@valibot/valibot";

type Base = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

type Serialized<T extends Base> =
  & Omit<T, "reference" | "~run" | "~standard">
  & {
    "~standard": Omit<StandardProps<unknown, unknown>, "validate">;
  };

export function serialize<T extends Base>(schema: T) {
  return JSON.parse(JSON.stringify(schema)) as Serialized<T>;
}

export function deserialize(data: ReturnType<typeof serialize>) {
  if (data.kind !== "schema") {
    throw new Error("Only schema deserialization is supported");
  }
  if (data["~standard"]?.vendor !== "valibot") {
    throw new Error("Only valibot schemas are supported");
  }
  if (data["~standard"]?.version !== 1) {
    throw new Error("Only valibot version 1 schemas are supported");
  }
  if (data.type === "string") return v.string();
  throw new Error(`Unsupported schema type: ${data.type}`);
}
