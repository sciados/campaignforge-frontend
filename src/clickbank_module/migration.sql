CREATE TABLE IF NOT EXISTS clickbank_accounts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) UNIQUE,
  nickname TEXT NOT NULL,
  clerk_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
