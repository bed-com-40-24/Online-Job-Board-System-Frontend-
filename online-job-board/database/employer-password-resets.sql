CREATE TABLE employer_password_resets (
  reset_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employer_id NUMBER NOT NULL
    REFERENCES employers (employer_id) ON DELETE CASCADE,
  token_hash VARCHAR2(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX employer_password_resets_employer_idx
  ON employer_password_resets (employer_id, used_at);