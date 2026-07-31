CREATE TABLE IF NOT EXISTS read_receipts (
    receipt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, 
    item_id UUID NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);
ALTER TABLE read_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for read_receipts" ON read_receipts;
CREATE POLICY "Enable all for read_receipts" ON read_receipts FOR ALL USING (true) WITH CHECK (true);
