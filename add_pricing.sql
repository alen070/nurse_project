-- Drop old pricing columns if they exist (safe measure)
ALTER TABLE nurse_profiles 
DROP COLUMN IF EXISTS hourly_rate,
DROP COLUMN IF EXISTS daily_rate,
DROP COLUMN IF EXISTS weekly_rate,
DROP COLUMN IF EXISTS monthly_rate;

-- Add new flexible pricing model columns
ALTER TABLE nurse_profiles 
ADD COLUMN IF NOT EXISTS base_rate INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rate_type VARCHAR(20) DEFAULT 'hourly';

-- Set constraints on rate_type for data integrity
ALTER TABLE nurse_profiles ADD CONSTRAINT valid_rate_type CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'monthly'));

-- Optional: If you had data in hourly_rate, you might want a manual migration. 
-- Otherwise, the defaults will apply.
UPDATE nurse_profiles SET base_rate = 0 WHERE base_rate IS NULL;
UPDATE nurse_profiles SET rate_type = 'hourly' WHERE rate_type IS NULL;
