// One-off converter: src/data/mockRecipes.js -> supabase/seed.sql
// Run with: node scripts/generateSeedSql.mjs
import { writeFileSync } from 'node:fs';
import { RECIPES } from '../src/data/mockRecipes.js';

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(arr) {
  return `ARRAY[${arr.map(sqlString).join(', ')}]::text[]`;
}

function sqlJsonb(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

const rows = RECIPES.map((r) => {
  const values = [
    sqlString(r.id), // slug: stable key for idempotent re-seeding, not the DB primary key
    'null', // owner_id: global recipe
    sqlString(r.name),
    sqlString(r.emoji),
    sqlString(r.color),
    sqlString(r.cuisine),
    sqlArray(r.mealTypes),
    sqlArray(r.tags),
    r.leftoverFriendly ? 'true' : 'false',
    r.calories,
    r.prepTime,
    r.servings,
    sqlJsonb(r.ingredients),
  ];
  return `  (${values.join(', ')})`;
}).join(',\n');

const sql = `-- Generated from src/data/mockRecipes.js — run after schema.sql
insert into public.recipes
  (slug, owner_id, name, emoji, color, cuisine, meal_types, tags, leftover_friendly, calories, prep_time, servings, ingredients)
values
${rows}
on conflict (slug) do nothing;
`;

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);
console.log(`Wrote supabase/seed.sql with ${RECIPES.length} recipes.`);
