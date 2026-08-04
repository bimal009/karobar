import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { product } from "./products";
import { customAttribute } from "./custom-attributes";
import { relations } from "drizzle-orm/_relations";

export const productCustomAttributeValue = pgTable(
  "product_custom_attribute_values",
  {
    id: uuid().defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),

    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => customAttribute.id, { onDelete: "cascade" }),

    value: text("value").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("product_custom_attribute_value_unique").on(
      table.productId,
      table.attributeId,
      table.value
    ),
    index("product_custom_attribute_value_product_idx").on(table.productId),
    index("product_custom_attribute_value_attribute_idx").on(table.attributeId),
  ]
);

export const productCustomAttributeValueRelations = relations(
  productCustomAttributeValue,
  ({ one }) => ({
    product: one(product, {
      fields: [productCustomAttributeValue.productId],
      references: [product.id],
    }),
    attribute: one(customAttribute, {
      fields: [productCustomAttributeValue.attributeId],
      references: [customAttribute.id],
    }),
  })
);

export type ProductCustomAttributeValue = typeof productCustomAttributeValue.$inferSelect;
export type ProductCustomAttributeValueInsert = typeof productCustomAttributeValue.$inferInsert;
