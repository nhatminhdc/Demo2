CREATE TABLE IF NOT EXISTS advisory_traits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trait_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS advisory_routines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  routine_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  response_template TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS advisory_routine_traits (
  routine_id INTEGER NOT NULL,
  trait_id INTEGER NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  required INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (routine_id, trait_id),
  FOREIGN KEY (routine_id) REFERENCES advisory_routines(id) ON DELETE CASCADE,
  FOREIGN KEY (trait_id) REFERENCES advisory_traits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS advisory_routine_products (
  routine_id INTEGER NOT NULL,
  product_knowledge_key TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'suggested',
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (routine_id, product_knowledge_key),
  FOREIGN KEY (routine_id) REFERENCES advisory_routines(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_advisory_traits_key
ON advisory_traits (trait_key);

CREATE INDEX IF NOT EXISTS idx_advisory_routine_traits_trait
ON advisory_routine_traits (trait_id);

CREATE VIEW IF NOT EXISTS advisory_routine_matrix AS
SELECT
  r.routine_key,
  r.title,
  r.priority,
  t.trait_key,
  t.label AS trait_label,
  t.category,
  rt.weight,
  rt.required,
  p.product_knowledge_key,
  p.role AS product_role
FROM advisory_routines r
JOIN advisory_routine_traits rt ON rt.routine_id = r.id
JOIN advisory_traits t ON t.id = rt.trait_id
LEFT JOIN advisory_routine_products p ON p.routine_id = r.id;
