-- Add status field to leaves table for approval workflow
-- Status: PENDING, APPROVED, REJECTED

-- Add status column with default PENDING
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Add approved_by column to track who approved/rejected
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Add approval timestamp
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);

-- Update existing records to have PENDING status if null
UPDATE leaves SET status = 'PENDING' WHERE status IS NULL;

COMMENT ON COLUMN leaves.status IS 'Leave request status: PENDING, APPROVED, or REJECTED';
COMMENT ON COLUMN leaves.approved_by IS 'Employee (CEO) who approved or rejected the leave';
COMMENT ON COLUMN leaves.approved_at IS 'Timestamp when leave was approved or rejected';
