src/lib/data-utilities/transformers/
├── core/                   # TRUE core transformation functions - all primitive operations
│   ├── document.ts           # ✏️ (was db-transformers.ts) Basic document transformations
│   ├── validation.ts         # ✏️ (was schema-validators.ts) Schema validation functions
│   ├── pipeline.ts           # 🌟 (extracted from domain-transformers.ts) Core transformation pipeline 
│   └── index.ts              # 🔄 (updated content) Exports all core functions
├── factories/              # ALL factory functions - anything that creates transformers
│   ├── domain.ts             # ➡️⬅️ (from domain-transformers.ts + transformer-factory.ts) Domain transformers
│   ├── reference.ts          # ✏️ (was reference-factory.ts) Reference object transformers
│   ├── response.ts           # 🌟 (new from transform-helpers.ts) Creates response transformers
│   ├── server-action.ts      # ✏️ (was server-action-factory.ts) Creates wrapped server actions
│   └── index.ts              # 🔄 (updated content) Exports all factory functions
├── utilities/              # Helper utilities and integrations
│   ├── entity.ts             # ✏️ (was entity-utils.ts) Entity operations
│   ├── response.ts           # ➡️⬅️ (from response-utils.ts + parts of transform-helpers.ts) Response handling 
│   ├── fetch.ts              # ✏️ (was fetch-by-id.ts) Database fetch operations
│   └── index.ts              # 🔄 (updated content) Exports all utilities
├── unified.ts              # ✏️ (was unified-transformer.ts) High-level unified transformation API
└── index.ts                # 🔄 (updated content) Main entry point