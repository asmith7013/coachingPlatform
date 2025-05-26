lib/server/
├── api/                      # API-specific functionality
│   ├── endpoints/            # 🟢 NEW folder
│   │   ├── reference/        # 🟠 MOVED from api/handlers/reference/
│   │   │   └── factory.ts    # 🟠 Renamed from endpoint-factory.ts
│   │   └── webhooks/         # 🟢 NEW folder
│   │       └── clerk.ts      # 🟠 MOVED from api/handlers/clerk-webhook.ts
│   ├── responses/            # 🟡 SAME location, just moved to server/
│   │   ├── formatters.ts     # 🟡 Unchanged
│   │   └── types.ts          # 🟢 NEW file (extracted from handlers/reference/types.ts)
│   ├── validation/           # 🟡 SAME location, just moved to server/
│   │   ├── clerk.ts          # 🟠 Renamed from clerk-validation.ts
│   │   ├── parse-query.ts    # 🟡 Unchanged
│   │   └── schema.ts         # 🟠 Renamed from integrated-validation.ts
│   └── index.ts              # 🟡 Unchanged
├── db/                       # 🟠 MOVED from data-server/db/
│   ├── connection.ts         # 🟡 Unchanged
│   ├── models/               # 🟢 NEW folder
│   ├── query/                # 🟢 NEW folder
│   │   └── builders.ts       # 🟠 Renamed from mongodb-query-utils.ts
│   └── index.ts              # 🟡 Unchanged
├── crud/                     # 🟠 MOVED from data-server/crud/
│   ├── actions.ts            # 🟠 Renamed from crud-action-factory.ts
│   ├── bulk.ts               # 🟠 Renamed from bulk-operations.ts
│   ├── operations.ts         # 🟠 Renamed from crud-operations.ts
│   └── index.ts              # 🟡 Unchanged
├── fetchers/                 # 🟠 MOVED from api/fetchers/
│   ├── factory.ts            # 🟡 Unchanged
│   ├── school.ts             # 🟡 Unchanged
│   ├── staff.ts              # 🟡 Unchanged
│   └── index.ts              # 🟡 Unchanged
├── file-handling/            # 🟠 MOVED from data-server/file-handling/
│   ├── csv.ts                # 🟠 Renamed from csv-parser.ts
│   ├── upload.ts             # 🟠 Renamed from file-upload.ts
│   └── index.ts              # 🟡 Unchanged
└── index.ts                  # 🟢 NEW file