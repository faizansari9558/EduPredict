-- ============================================================================
-- EduPredict Phase 15 Schema: Notification Center & Real-Time Alerts
-- ============================================================================

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(255) NULL;
