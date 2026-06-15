import { defineConfig } from "@adobe/aio-commerce-lib-app/config";

export default defineConfig({
  metadata: {
    id: "pinepapple-commerce-platform",
    displayName: "Pinepapple Commerce Platform",
    description: "Premium commerce platform for Pinepapple products, services, trade-ins, support, and operations.",
    version: "1.0.0",
  },
  eventing: {
    commerce: [
      {
        provider: {
          label: "Pinepapple Commerce Events",
          description: "Reactive order, catalog, inventory, and customer updates for Pinepapple experiences.",
        },
        events: [
          {
            name: "observer.sales_order_save_commit_after",
            label: "Order Saved",
            description: "Emitted after an order is persisted so downstream services can update fulfillment and customer views.",
            fields: [
              { name: "entity_id" },
              { name: "increment_id" },
              { name: "state" },
              { name: "status" },
            ],
            runtimeActions: ["pinepapple-events/order-updated"],
          },
          {
            name: "observer.catalog_product_save_after",
            label: "Product Saved",
            description: "Emitted after a product is saved so search, merchandising, and caches can refresh.",
            fields: [
              { name: "entity_id" },
              { name: "sku" },
              { name: "updated_at" },
            ],
            runtimeActions: ["pinepapple-events/product-updated"],
          },
          {
            name: "observer.inventory_source_item_save_after",
            label: "Inventory Source Item Saved",
            description: "Emitted after inventory changes so availability and service eligibility can refresh.",
            fields: [
              { name: "sku" },
              { name: "source_code" },
              { name: "quantity" },
              { name: "status" },
            ],
            runtimeActions: ["pinepapple-events/inventory-updated"],
          },
        ],
      },
    ],
  },
});
