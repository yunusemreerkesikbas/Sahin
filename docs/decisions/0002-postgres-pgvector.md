# 0002 — Postgres + pgvector

- **Status**: accepted
- **Date**: 2026-05-13

## Context

The job radar stores structured rows (jobs, evaluations, proposals, feedback), nested platform metadata (varies per platform), and — eventually — CV/job embeddings for semantic match. We needed a single store that handles all three without a sidecar vector DB.

Alternatives considered:

- **SQLite**: easy locally, but no native JSONB indexing and no embeddings story.
- **MySQL**: has JSON but indexing is weaker, no first-class vector type.
- **Dedicated vector DB (pgvector-cloud / Qdrant)**: extra moving piece, sync complexity.

## Decision

**Postgres 17 with the pgvector extension**, hosted in Docker locally. The schema uses `jsonb` for per-platform `meta` and a `vector(1024)` column on `user_profile.embedding_vector`. `DATABASE_URL` is the only env var consumers see, so swapping local Docker for managed Postgres (Neon, Supabase, Hetzner-managed) is one line.

## Consequences

- Easy: one store for structured + JSON + vector. Drizzle ORM has first-class `jsonb` and `vector` support.
- Easy: future migration to managed Postgres is env-only.
- Harder: requires the `pgvector/pgvector:pg17` image locally (not the official `postgres` image). The first migration must `CREATE EXTENSION IF NOT EXISTS vector;` before any vector column is created.
- Follow-up: when embeddings come online (Phase 1.5), benchmark IVFFlat vs HNSW indexes against the actual job volume before locking in an index strategy.
