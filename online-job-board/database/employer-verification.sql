-- Run once against the Oracle schema that owns EMPLOYERS before deploying
-- registration writes that include provider verification results.
DECLARE
  column_count PLS_INTEGER;
  constraint_count PLS_INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
    FROM USER_TAB_COLUMNS
   WHERE TABLE_NAME = 'EMPLOYERS'
     AND COLUMN_NAME = 'VERIFICATION_STATUS';
  IF column_count = 0 THEN
    EXECUTE IMMEDIATE q'[
      ALTER TABLE employers ADD (
        verification_status VARCHAR2(20) DEFAULT 'Pending' NOT NULL
      )
    ]';
  END IF;

  UPDATE employers
     SET verification_status = 'Pending'
   WHERE verification_status IS NULL
      OR verification_status = 'Pending verification';

  SELECT COUNT(*) INTO column_count
    FROM USER_TAB_COLUMNS
   WHERE TABLE_NAME = 'EMPLOYERS'
     AND COLUMN_NAME = 'VERIFICATION_REASON';
  IF column_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE employers ADD (verification_reason VARCHAR2(1000))';
  END IF;

  SELECT COUNT(*) INTO column_count
    FROM USER_TAB_COLUMNS
   WHERE TABLE_NAME = 'EMPLOYERS'
     AND COLUMN_NAME = 'VERIFICATION_CHECKED_AT';
  IF column_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE employers ADD (verification_checked_at TIMESTAMP)';
  END IF;

  SELECT COUNT(*) INTO constraint_count
    FROM USER_CONSTRAINTS
   WHERE CONSTRAINT_NAME = 'CHK_EMPLOYER_VERIFICATION_STATUS';
  IF constraint_count = 0 THEN
    EXECUTE IMMEDIATE q'[
      ALTER TABLE employers ADD CONSTRAINT chk_employer_verification_status
      CHECK (verification_status IN ('Pending', 'Verified', 'Rejected'))
    ]';
  END IF;
END;
/
