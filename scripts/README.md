# Scripts Directory

This directory contains utility scripts for the Journal Safe project.

## Available Scripts

### generate-seed-sql.js

Generates SQL migration file from JSON content files.

**Purpose**: Converts `content/prompts.json` and `content/affirmations.json` into a SQL migration file that can be applied to the Supabase database.

**Usage**:
```bash
# Run directly
node scripts/generate-seed-sql.js

# Or use npm script
npm run seed:generate
```

**Input**:
- `/content/prompts.json` - 100 journaling prompts (bilingual)
- `/content/affirmations.json` - 50 affirmations (bilingual)

**Output**:
- `/supabase/migrations/004_seed_data.sql` - Generated SQL migration

**Features**:
- ✅ Automatically escapes SQL special characters
- ✅ Maps JSON structure to database schema
- ✅ Uses English text only (`text_en` field)
- ✅ Generates idempotent INSERT statements
- ✅ Validates JSON structure
- ✅ Reports counts and summary

**Schema Mapping**:
- JSON `category` → DB `category` (prompts)
- JSON `theme` → DB `category` (affirmations)
- JSON `text_en` → DB `prompt_text` (prompts)
- JSON `text_en` → DB `affirmation_text` (affirmations)

**When to Use**:
- After editing content in JSON files
- Before creating a new database migration
- When updating seed data for a new deployment

**Example Output**:
```
🔄 Generating SQL seed script from JSON files...

📖 Reading /home/user/ai-assistant/content/prompts.json
   ✓ Found 100 prompts

📖 Reading /home/user/ai-assistant/content/affirmations.json
   ✓ Found 50 affirmations

🔨 Generating SQL statements...

💾 Writing to /home/user/ai-assistant/supabase/migrations/004_seed_data.sql
   ✓ File written successfully

✨ Summary:
   - 100 prompts
   - 50 affirmations
   - Output: /home/user/ai-assistant/supabase/migrations/004_seed_data.sql

✅ Done! Run "supabase db push" to apply the migration.
```

## Future Scripts

Ideas for additional scripts to add:

- **validate-content.js**: Validate JSON structure and content guidelines
- **export-csv.js**: Export prompts/affirmations to CSV for review
- **import-translations.js**: Import translated content from translators
- **content-stats.js**: Generate statistics about content distribution
- **duplicate-check.js**: Check for duplicate prompts/affirmations

## Development Guidelines

When creating new scripts:

1. **Use Node.js**: Keep scripts compatible with Node.js (no TypeScript compilation required)
2. **Add shebang**: Start with `#!/usr/bin/env node` for direct execution
3. **Document usage**: Add clear comments and usage instructions
4. **Handle errors**: Provide helpful error messages
5. **Add to package.json**: Create npm script for convenience
6. **Update this README**: Document new scripts here

## Related Documentation

- [SEED_DATA.md](/docs/SEED_DATA.md) - Complete seed data documentation
- [Database Schema](/supabase/migrations/001_initial_schema.sql) - Database structure
- [Content Guidelines](/docs/SEED_DATA.md#content-guidelines) - Content creation rules
