import { integer, pgEnum, pgTable, pgView, text } from "drizzle-orm/pg-core";
import { gt } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-valibot";
import { describe, test } from "@std/testing/bdd";
import { e2eCheck } from "./_common.ts";

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
});
