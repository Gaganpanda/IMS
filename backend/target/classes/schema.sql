-- ════════════════════════════════════════════════════
--  IMS Database Schema
--  Run this once to create the database.
--  Hibernate ddl-auto=update will manage table changes.
-- ════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS ims_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ims_db;

-- ── Users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  username    VARCHAR(100) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  email       VARCHAR(150),
  role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME,
  updated_at  DATETIME,
  PRIMARY KEY (id),
  UNIQUE KEY uq_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id                      BIGINT       NOT NULL AUTO_INCREMENT,
  name                    VARCHAR(200) NOT NULL,
  code                    VARCHAR(50)  NOT NULL,
  category                VARCHAR(100),
  description             TEXT,
  priority                VARCHAR(20),
  expected_completion_date DATE,
  image_url               VARCHAR(500),

  -- Development
  development_status      VARCHAR(30),
  development_date        DATE,
  remarks                 VARCHAR(200),

  -- ToT
  tot_status              VARCHAR(30),
  tot_document_no         VARCHAR(100),
  filled_date             DATE,

  -- Trials
  trials_status           VARCHAR(30),
  sample_request_date     DATE,
  sample_submission_date  DATE,

  -- IPR
  ipr_status              VARCHAR(30),
  patent_number           VARCHAR(100),
  filing_date             DATE,

  -- Procurement
  crbf_count              INT,
  ssb_count               INT,

  -- Key Info
  weight                  VARCHAR(50),
  size                    VARCHAR(50),
  material                VARCHAR(200),
  color                   VARCHAR(50),
  unit_cost               DOUBLE,
  vendor                  VARCHAR(200),
  warranty                VARCHAR(100),

  -- Audit
  created_by_id           BIGINT,
  created_at              DATETIME,
  updated_at              DATETIME,

  PRIMARY KEY (id),
  UNIQUE KEY uq_item_code (code),
  KEY idx_item_category   (category),
  KEY idx_item_dev_status (development_status),
  KEY idx_item_updated    (updated_at),
  CONSTRAINT fk_item_user FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Item Trial Stakeholders ─────────────────────────
CREATE TABLE IF NOT EXISTS item_trial_stakeholders (
  item_id     BIGINT      NOT NULL,
  stakeholder VARCHAR(50) NOT NULL,
  KEY idx_its_item (item_id),
  CONSTRAINT fk_its_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Item Documentation ──────────────────────────────
CREATE TABLE IF NOT EXISTS item_documentation (
  item_id  BIGINT       NOT NULL,
  doc_name VARCHAR(200) NOT NULL,
  KEY idx_id_item (item_id),
  CONSTRAINT fk_id_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Item ToT Documents Filed (TTD / TNF / TAC / CEC) ─
CREATE TABLE IF NOT EXISTS item_tot_documents (
  item_id       BIGINT      NOT NULL,
  document_code VARCHAR(20) NOT NULL,
  KEY idx_itd_item (item_id),
  CONSTRAINT fk_itd_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Notifications ───────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  user_id    BIGINT,
  title      VARCHAR(100) NOT NULL,
  message    VARCHAR(500) NOT NULL,
  type       VARCHAR(50),
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  item_id    BIGINT,
  item_name  VARCHAR(200),
  created_at DATETIME,
  PRIMARY KEY (id),
  KEY idx_notif_user    (user_id),
  KEY idx_notif_read    (is_read),
  KEY idx_notif_created (created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
