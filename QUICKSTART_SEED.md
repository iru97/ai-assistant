# Database Seed - Quick Start

## 🚀 Apply Seed Data (First Time)

```bash
npm run db:push
```

This will:
- Create database tables (if not exists)
- Insert 100 prompts
- Insert 50 affirmations

## 🔄 Update Content Workflow

```bash
# 1. Edit JSON files
vim content/prompts.json
vim content/affirmations.json

# 2. Regenerate SQL
npm run seed:generate

# 3. Apply to database
npm run db:push
```

## 📊 Verify Data

In Supabase Studio:
- **prompts** table → should have 100 rows
- **affirmations** table → should have 50 rows

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/004_seed_data.sql` | SQL migration (generated) |
| `scripts/generate-seed-sql.js` | Generator script |
| `content/prompts.json` | Source: 100 prompts |
| `content/affirmations.json` | Source: 50 affirmations |
| `docs/SEED_DATA.md` | Full documentation |

## 🆘 Troubleshooting

**No data appearing?**
```bash
# Check migration status
supabase migration list

# Check Supabase Studio for data
```

**Need to reset?** (WARNING: Deletes all data)
```bash
npm run db:reset
```

## 📖 Full Documentation

See `/home/user/ai-assistant/docs/SEED_DATA.md` for complete guide.
