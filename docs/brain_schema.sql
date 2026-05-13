CREATE TABLE IF NOT EXISTS product_knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cau_hoi_chu_de TEXT NOT NULL,
  noi_dung_chi_tiet TEXT NOT NULL,
  luu_y_khi_tu_van TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_product_knowledge_topic
ON product_knowledge (cau_hoi_chu_de);
