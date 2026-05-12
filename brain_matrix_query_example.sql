-- Ví dụ truy xuất routine đa điều kiện trong brain.db
-- Thay các dòng VALUES bên dưới bằng trait mà AI nhận diện được từ tin nhắn khách.

WITH input_traits(trait_key) AS (
  VALUES
    ('hot_lead'),
    ('installment'),
    ('budget_13_16')
),
routine_scores AS (
  SELECT
    r.id,
    r.routine_key,
    r.title,
    r.summary,
    r.response_template,
    r.priority,
    SUM(CASE WHEN i.trait_key IS NOT NULL THEN rt.weight ELSE 0 END) + r.priority AS score,
    SUM(CASE WHEN i.trait_key IS NOT NULL THEN 1 ELSE 0 END) AS matched_traits,
    COUNT(rt.trait_id) AS total_traits,
    SUM(CASE WHEN rt.required = 1 AND i.trait_key IS NULL THEN 1 ELSE 0 END) AS missing_required
  FROM advisory_routines r
  JOIN advisory_routine_traits rt ON rt.routine_id = r.id
  JOIN advisory_traits t ON t.id = rt.trait_id
  LEFT JOIN input_traits i ON i.trait_key = t.trait_key
  GROUP BY r.id
)
SELECT
  routine_key,
  title,
  summary,
  response_template,
  score,
  matched_traits,
  total_traits
FROM routine_scores
WHERE missing_required = 0
ORDER BY score DESC, matched_traits DESC, priority DESC
LIMIT 1;
