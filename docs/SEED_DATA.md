# Database Seed Data

This document explains how to populate the Supabase database with prompts and affirmations for the Journal Safe app.

## Overview

The app uses two content tables:
- **prompts**: 100 journaling prompts for self-reflection
- **affirmations**: 50 affirmations for eating disorder recovery support

## Data Sources

All content is sourced from JSON files:
- `/content/prompts.json` - 100 prompts in 5 categories
- `/content/affirmations.json` - 50 affirmations in 5 themes

### Prompts Categories
1. **gratitude** (20 prompts) - Focusing on appreciation and thankfulness
2. **self-compassion** (25 prompts) - Practicing kindness toward oneself
3. **emotional-reflection** (20 prompts) - Understanding and processing emotions
4. **progress-growth** (15 prompts) - Recognizing personal development
5. **coping-resilience** (20 prompts) - Building healthy coping mechanisms

### Affirmations Themes
1. **unconditional_self_worth** (15 affirmations) - Worth independent of appearance
2. **recovery_is_non_linear** (10 affirmations) - Normalizing the recovery journey
3. **body_acceptance** (10 affirmations) - Honoring the body
4. **nourishment_and_self_care** (10 affirmations) - Permission to care for self
5. **strength_and_resilience** (5 affirmations) - Acknowledging inner strength

## Database Schema

### Prompts Table
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Affirmations Table
```sql
CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  affirmation_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Migration Files

### 004_seed_data.sql

Located at: `/supabase/migrations/004_seed_data.sql`

This migration:
- ✅ Inserts 100 prompts
- ✅ Inserts 50 affirmations
- ✅ Is idempotent (safe to run multiple times)
- ✅ Only inserts if tables are empty
- ✅ Uses English text only (text_en from JSON)

**Note**: The migration currently uses English text only. Future versions will support multiple languages with proper i18n handling.

## How to Use

### Option 1: Apply Migration (Recommended)

This is the standard way to seed the database in production:

```bash
# Apply all pending migrations (including seed data)
npm run db:push
# OR
supabase db push
```

### Option 2: Regenerate SQL from JSON

If you update the JSON files, regenerate the SQL migration:

```bash
# Regenerate 003_seed_data.sql from JSON files
npm run seed:generate
# OR
node scripts/generate-seed-sql.js

# Then apply the migration
npm run db:push
```

### Option 3: Reset Database (Development Only)

To reset the entire database (WARNING: deletes all data):

```bash
# Reset database and reapply all migrations
npm run db:reset
# OR
supabase db reset
```

## Workflow for Adding/Editing Content

### Adding New Prompts or Affirmations

1. **Edit the JSON file**:
   ```bash
   # Edit prompts
   vim content/prompts.json

   # Edit affirmations
   vim content/affirmations.json
   ```

2. **Regenerate the SQL migration**:
   ```bash
   npm run seed:generate
   ```

3. **Create a new migration** (don't overwrite 004):
   ```bash
   # Generate timestamp for new migration
   supabase migration new seed_data_update_$(date +%Y%m%d)

   # Copy the generated SQL to the new migration
   cp supabase/migrations/004_seed_data.sql supabase/migrations/006_seed_data_update_YYYYMMDD.sql
   ```

4. **Apply the migration**:
   ```bash
   npm run db:push
   ```

### Updating Existing Content

To update existing prompts/affirmations without duplicates:

1. Edit the JSON files
2. Regenerate the SQL
3. Manually create an UPDATE migration instead of INSERT:
   ```sql
   UPDATE prompts
   SET prompt_text = 'New text here'
   WHERE category = 'gratitude' AND prompt_text = 'Old text here';
   ```

## Content Guidelines

When adding or editing content, follow these principles:

### For Prompts:
- ✅ Focus on feelings and emotions (NO numbers, weights, calories)
- ✅ Use gentle, non-judgmental language
- ✅ Encourage self-reflection without shame
- ✅ Keep questions open-ended
- ✅ Avoid diet culture language

### For Affirmations:
- ✅ Use present-tense, affirming statements
- ✅ Focus on unconditional worth
- ✅ Normalize the recovery process
- ✅ Avoid appearance-based compliments
- ✅ Emphasize internal qualities

## Data Validation

The generator script (`generate-seed-sql.js`) automatically:
- ✅ Escapes single quotes for SQL safety (`What's` → `What''s`)
- ✅ Maps JSON fields to database columns
- ✅ Validates JSON structure
- ✅ Counts and reports inserted records

## Bilingual Support (Future)

Current state:
- JSON files contain both English (`text_en`) and Spanish (`text_es`)
- Database only stores English text
- Future: Add language columns or i18n table structure

Planned migration:
```sql
-- Future schema (not implemented yet)
ALTER TABLE prompts ADD COLUMN text_en TEXT;
ALTER TABLE prompts ADD COLUMN text_es TEXT;
ALTER TABLE prompts DROP COLUMN prompt_text;
```

## Troubleshooting

### Migration fails with "relation already exists"
The migration is idempotent. If tables already have data, it won't insert duplicates.

### No data appearing in app
1. Check that migration was applied: `supabase migration list`
2. Verify data in Supabase Studio
3. Check RLS policies allow authenticated users to read prompts/affirmations

### Wrong column names
The script uses:
- `prompt_text` (not `text`) for prompts
- `affirmation_text` (not `text`) for affirmations
- `category` (not `theme`) for both tables

If your schema differs, update the generator script.

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| Generate SQL | `npm run seed:generate` | Regenerate 004_seed_data.sql from JSON |
| Push migrations | `npm run db:push` | Apply pending migrations to database |
| Reset database | `npm run db:reset` | Reset DB and reapply all migrations (DEV ONLY) |

## Files

```
ai-assistant/
├── content/
│   ├── prompts.json              # 100 prompts (bilingual)
│   └── affirmations.json         # 50 affirmations (bilingual)
├── scripts/
│   └── generate-seed-sql.js      # SQL generator script
├── supabase/migrations/
│   ├── 001_initial_schema.sql    # Database schema
│   ├── 002_storage_setup.sql     # Storage buckets
│   ├── 003_auto_create_profile.sql # Auto-create profile trigger
│   ├── 004_seed_data.sql         # Seed data (GENERATED)
│   └── 005_complete_user_settings.sql # User settings updates
└── docs/
    └── SEED_DATA.md              # This file
```

## Next Steps

After seeding the database:

1. ✅ Verify data in Supabase Studio
2. ✅ Test fetching prompts in app
3. ✅ Test fetching affirmations in app
4. ✅ Implement prompt rotation logic
5. ✅ Implement affirmation rotation logic
6. 🔄 Plan multilingual support
7. 🔄 Add admin interface for content management

## License & Content Attribution

All prompts and affirmations are original content created specifically for the Journal Safe app, designed to support individuals in eating disorder recovery.

**Important**: This content is trauma-informed and ED-safe. When editing, please consult with ED recovery professionals to ensure content remains therapeutic and non-triggering.
