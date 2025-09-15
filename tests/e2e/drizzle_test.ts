import { integer, pgEnum, pgTable, pgView, text } from "drizzle-orm/pg-core";
import { gt } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-valibot";
import { describe, test } from "@std/testing/bdd";
import { e2eCheck } from "./_common.ts";
import * as pg from "drizzle-orm/pg-core";
import * as vs from "../../main.ts";

describe("e2e - drizzle", () => {
  describe("official examples from https://orm.drizzle.team/docs/valibot", () => {
    const users = pgTable("users", {
      id: integer().generatedAlwaysAsIdentity().primaryKey(),
      name: text().notNull(),
      age: integer().notNull(),
    });

    test("users example", async () => {
      await e2eCheck(createSelectSchema(users));
      await e2eCheck(createInsertSchema(users));
      await e2eCheck(createUpdateSchema(users));
    });

    test("enums", async () => {
      const roles = pgEnum("roles", ["admin", "basic"]);
      await e2eCheck(createSelectSchema(roles));
    });

    test("views", async () => {
      const view = pgView("users_view").as((qb) =>
        qb.select().from(users).where(gt(users.age, 18))
      );
      await e2eCheck(createSelectSchema(view));
    });
  });

  describe("auto-detect drizzle base types", () => {
    // Discovery phase: build a list of supported and skipped builders.
    const candidates = Object.entries(pg).filter(([, value]) =>
      typeof value === "function"
    ) as Array<[string, (...args: unknown[]) => unknown]>;

    const supported: Array<
      [name: string, select: unknown, insert: unknown, update: unknown]
    > = [];
    const skipped: Array<[name: string, reason: string]> = [];

    for (const [name, _builder] of candidates) {
      try {
        // @ts-expect-error - dynamic builder typing for e2e discovery
        const table = pgTable(`auto_${name}`, (t) => {
          const fn = (t as Record<string, unknown>)[name] as unknown;
          try {
            if (name === "varchar" || name === "char") {
              const c = (fn as (x: unknown) => unknown)({ length: 255 });
              return { c } as Record<string, unknown>;
            } else if (name === "decimal" || name === "numeric") {
              const c = (fn as (x: unknown) => unknown)({
                precision: 10,
                scale: 2,
              });
              return { c } as Record<string, unknown>;
            } else {
              const c = (fn as () => unknown)();
              return { c } as Record<string, unknown>;
            }
          } catch {
            return {} as Record<string, unknown>;
          }
        });

        const tbl = table as unknown as Record<string, unknown>;
        if (!("c" in tbl) || tbl.c == null) {
          skipped.push([name, "no column created"]);
          continue;
        }

        const select = createSelectSchema(table);
        const insert = createInsertSchema(table);
        const update = createUpdateSchema(table);
        try {
          vs.fromValibot(select);
          vs.fromValibot(insert);
          vs.fromValibot(update);
          supported.push([name, select, insert, update]);
        } catch (err) {
          skipped.push([name, (err as Error).message ?? "serialize failed"]);
          continue;
        }
      } catch (err) {
        skipped.push([name, (err as Error).message ?? "construction failed"]);
        continue;
      }
    }

    // Summary log
    test("discovery summary", () => {
      const ok = supported.map((x) => x[0]).sort();
      const no = skipped.map((x) => x[0]).sort();
      console.info("drizzle autodetect — testing:", ok.join(", "));
      if (no.length) {
        console.info("drizzle autodetect — skipping:", no.join(", "));
      }
    });

    // Test phase
    for (const [name, select, insert, update] of supported) {
      test(`base type: ${name}`, async () => {
        await e2eCheck(select as never);
        await e2eCheck(insert as never);
        await e2eCheck(update as never);
      });
    }
  });
});
