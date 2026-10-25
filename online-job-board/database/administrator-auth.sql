CREATE TABLE administrators (
  admin_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR2(320 CHAR) NOT NULL UNIQUE,
  password_hash VARCHAR2(255 CHAR) NOT NULL,
  full_name VARCHAR2(100 CHAR) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE administrator_password_resets (
  reset_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id NUMBER NOT NULL
    REFERENCES administrators (admin_id) ON DELETE CASCADE,
  token_hash VARCHAR2(64 CHAR) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX administrator_password_resets_admin_idx
  ON administrator_password_resets (admin_id, used_at);

COMMIT;
