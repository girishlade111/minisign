CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Legacy fields (for backward compatibility)
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by VARCHAR(255),
    signature_data_url TEXT,
    
    -- New fields for multiple signatures
    owner_signed_at TIMESTAMP WITH TIME ZONE,
    owner_signature_data_url TEXT,
    recipient_signed_at TIMESTAMP WITH TIME ZONE,
    recipient_signature_data_url TEXT,
    recipient_signed_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Update existing signed documents to move data to recipient columns (if any exist)
UPDATE documents 
SET 
  recipient_signed_at = signed_at,
  recipient_signature_data_url = signature_data_url,
  recipient_signed_by = signed_by
WHERE signed_at IS NOT NULL 
  AND recipient_signed_at IS NULL;
