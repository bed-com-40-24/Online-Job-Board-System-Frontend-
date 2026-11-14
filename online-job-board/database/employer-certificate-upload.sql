-- Run once as the EMPLOYER_APP schema owner after employer-security.sql.
ALTER TABLE employers ADD (
  business_registration_certificate_file BLOB,
  business_registration_certificate_name VARCHAR2(255 CHAR),
  business_registration_certificate_mime VARCHAR2(50 CHAR)
);

COMMIT;
