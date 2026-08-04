import type { ExtractTablesFromSchema, RelationsBuilder } from "drizzle-orm/relations"
import type * as schema from "./index"

type Schema = ExtractTablesFromSchema<typeof schema>

/**
 * Single source of truth for cross-table relations used by the typed
 * `db.query.*` relational API (drizzle-orm v1's `defineRelations`).
 */
export function buildRelationsConfig(r: RelationsBuilder<Schema>) {
  return {
    product: {
      category: r.one.category({ from: r.product.categoryId, to: r.category.id }),
      subCategory: r.one.subCategory({ from: r.product.subCategoryId, to: r.subCategory.id }),
      brand: r.one.brand({ from: r.product.brandId, to: r.brand.id }),
      unit: r.one.unit({ from: r.product.unitId, to: r.unit.id }),
      warranty: r.one.warranty({ from: r.product.warrantyId, to: r.warranty.id }),
      customAttributeValues: r.many.productCustomAttributeValue({
        from: r.product.id,
        to: r.productCustomAttributeValue.productId,
      }),
    },
    productCustomAttributeValue: {
      product: r.one.product({ from: r.productCustomAttributeValue.productId, to: r.product.id }),
      attribute: r.one.customAttribute({
        from: r.productCustomAttributeValue.attributeId,
        to: r.customAttribute.id,
      }),
    },
  }
}
