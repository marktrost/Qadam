-- Add test_attempts table for storing incomplete tests and progress

CREATE TABLE IF NOT EXISTS test_attempts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant_id VARCHAR NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  test_session_id VARCHAR NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  answers JSONB DEFAULT '{}',
  time_spent INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  -- Ensure unique session per user+variant combination
  UNIQUE(user_id, variant_id, test_session_id)
);

-- Индексы для быстрого поиска незавершенных тестов
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_variant_incomplete 
  ON test_attempts(user_id, variant_id) 
  WHERE is_completed = false;

-- Индекс для поиска по сессии
CREATE INDEX IF NOT EXISTS idx_test_attempts_session 
  ON test_attempts(test_session_id);

-- Индекс для поиска завершенных тестов по дате
CREATE INDEX IF NOT EXISTS idx_test_attempts_completed 
  ON test_attempts(completed_at) 
  WHERE is_completed = true;

-- Комментарий к таблице
COMMENT ON TABLE test_attempts IS 'Хранит прогресс незавершенных тестов и историю попыток';
