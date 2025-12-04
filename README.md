Automated Data Visualization Platform

Overview
- Upload a spreadsheet (XLSX/CSV), infer column types, store data in MongoDB, auto-generate a dashboard and charts, and query aggregates via API.

Tech Stack
- Backend: Node.js, Express, Mongoose, Multer, XLSX (xlsx), PapaParse (via XLSX where needed)
- Frontend: React (Vite), Recharts, Tailwind utilities, Radix UI primitives
- Database: MongoDB

Repository Structure
- backend/
  - index.js: Express app initialization, CORS, logging, route mounting, graceful shutdown
  - db/db.js: Mongo connection builder (supports SRV/TLS), connectMongo()
  - routes/: HTTP endpoints mapping
  - controllers/: Request handling and responses
  - models/: Mongoose schemas
  - services/: File parsing, type inference, and auto-visualization
  - middleware/errorHandler.js: Unified error responses
  - utils/logger.js: Console logger with colors
- frontend/
  - index.html, vite.config.ts: Vite app config and entry HTML
  - src/: React application
    - main.tsx: React bootstrap
    - App.tsx: High-level flow (upload → schema review → dashboard)
    - components/: UI building blocks (charts, upload, filters, layout)
    - styles/: Global styles

Backend
Server
- Express app with colored request logs, CORS allowlist for local dev, JSON body limit configurable via JSON_BODY_LIMIT.
- 404 handler and centralized error handler.

Environment
- PORT: HTTP port (default 4000)
- Mongo connection is derived from either MONGO_URI (preferred) or the following variables:
  - MONGO_HOST (default localhost:27017)
  - MONGO_DB (default autodash)
  - MONGO_USER / MONGO_PASS (optional)
  - MONGO_SRV (auto-detect for *.mongodb.net; set to false to disable)
  - MONGO_TLS (default true when SRV)
  - MONGO_AUTH_SOURCE (e.g., admin)
  - MONGO_MECHANISM, MONGO_PARAMS (advanced)
  - MONGO_DEBUG (true to enable mongoose debug)

Models (Mongo Collections)
- User: Minimal user records (reference only)
- Upload: Upload metadata and status lifecycle
- Dataset: Dataset metadata (one per upload)
- DatasetField: Inferred schema for each dataset column
- DatasetRecord: Raw rows for each dataset
- Dashboard: Generated dashboards per dataset
- Chart: Charts attached to dashboards (type, fields, aggregation)
- Filter: Dashboard-level filters
- ChartFilter: Filter-to-chart associations with include/exclude mode
- CachedAggregate: Cached aggregation results (TTL-based)
- ProcessingJob: Background job tracking (not scheduled by default)

Services
- parseFile.parseBuffer(buffer, mimeType, name): Read first sheet to headers/rows using xlsx.
- inferTypes.inferTypes(headers, rows): Infer categorical/numerical/temporal with stats and top values.
- autoVisualize.autoVisualize(datasetId): Create a dashboard, bar/line/pie charts when fields allow, and a categorical filter linked to charts.

Routes → Controllers
- GET /: Health text
- GET /status: Service and DB state
- POST /upload: Accepts multipart field "file"; parses, stores dataset, infers types, loads rows, auto-creates dashboard/charts; returns ids and counts
- GET /datasets: List datasets
- GET /datasets/:id: Dataset by id
- GET /datasets/:id/fields: Fields for a dataset
- GET /datasets/:id/records?limit=&page=: Paginated rows
- GET /dashboards/:id: Dashboard by id
- GET /dashboards/dataset/:datasetId: Dashboards by dataset (controller exists; ensure route is wired if needed)
- GET /dashboards/:id/charts: Charts by dashboard (controller exists; ensure route is wired if needed)
- GET /charts/:id: Chart by id
- GET /uploads: List uploads
- GET /uploads/:id: Upload by id
- GET /users: List users
- GET /users/:id: User by id
- GET /dashboards/:dashboardId/filters: Filters for a dashboard
- GET /chart-filters/:chartId (controller provided via chartFilters.byChart; ensure route is wired if needed)
- POST /aggregate: Ad-hoc aggregations over DatasetRecord with optional dimensions, measures, filters, and time bucketing

Aggregation API (POST /aggregate)
- Request: { datasetId, dimensions: [fieldNames], measures: [{ field, agg: sum|avg|min|max|count }], filters: { field: value|[values] }, timeBucket: day|month|year, timeField }
- Response: { rows: [{ ...groupKeys, metric1, metric2, ... }] } sorted by dimensions.

Ingestion Flow
1) POST /upload (multipart file)
2) Parse to headers/rows
3) Infer types and persist Dataset/DatasetField/DatasetRecord
4) Auto-create Dashboard/Chart/Filter and link
5) Return datasetId, dashboardId, counts

Frontend
App Flow
- Upload: Client-side file selection → parsing preview handled in components; server path exists for full ingestion.
- Schema Review: Confirm/adjust inferred types.
- Dashboard: Render charts from local data using Recharts with filter sidebar.

Key Components
- FileUpload.tsx: Reads spreadsheet, previews data, emits DatasetInfo
- SchemaReview.tsx: Display and edit column types
- Dashboard.tsx: Aggregate-like summaries and charts (bar/line/pie) with filters
- ChartCard.tsx, FilterSidebar.tsx, ThemeToggle.tsx: UI primitives

Local Development
- Backend
  - cd backend && npm install && npm start
  - Ensure MongoDB reachable via MONGO_URI or MONGO_* vars
- Frontend
  - cd frontend && npm install && npm run dev (opens http://localhost:3000)

Notes
- Some controllers exist without matching route files in routes/ (dashboards.js, chartFilters.js). If missing, add routes that call the provided controllers.
- CORS allowlist includes localhost:5173, 3000, 5001 for dev.

License
- MIT (see LICENSE)
