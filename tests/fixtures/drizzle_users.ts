import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: text().notNull(),
  age: integer().notNull(),
});
