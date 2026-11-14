-- Run once as the EMPLOYER_APP schema owner after the employers table exists.
ALTER TABLE employers ADD (
  business_registration_certificate VARCHAR2(100 CHAR),
  physical_business_address VARCHAR2(500 CHAR),
  company_phone VARCHAR2(20 CHAR),
  representative_name VARCHAR2(100 CHAR),
  representative_position VARCHAR2(100 CHAR)
);

CREATE TABLE login_attempts (
  account_type VARCHAR2(20 CHAR) NOT NULL
    CHECK (account_type IN ('employer', 'admin')),
  email_hash CHAR(64 CHAR) NOT NULL,
  failed_attempts NUMBER DEFAULT 0 NOT NULL
    CHECK (failed_attempts >= 0),
  locked_until TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT login_attempts_pk PRIMARY KEY (account_type, email_hash)
);

COMMIT;
