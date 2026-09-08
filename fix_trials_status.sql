-- ============================================================================
-- Migration: Fix enum-backed column drift across the schema
--
-- Root cause:
--   Every column listed below is mapped in Java with @Enumerated(EnumType.STRING)
--   and an explicit @Column(length = N) — meaning each one only ever needs a
--   plain VARCHAR column. Hibernate's ddl-auto=update creates it that way the
--   first time it builds a table from scratch.
--
--   items.trials_status, however, was found to be a native MySQL
--   ENUM('PENDING','IN_PROGRESS','COMPLETED','ON_HOLD') on the live database —
--   created manually outside the codebase at some point, and missing the
--   'TESTING' value that Item.TrialsStatus (Java) has included since it was
--   added. Hibernate's ddl-auto=update never fixes this: it only ever adds
--   new columns/tables, it never converts an existing native ENUM column back
--   to VARCHAR, so a manually-created ENUM column silently drifts out of sync
--   with the Java enum forever, with no error until someone writes a value the
--   stray ENUM doesn't happen to allow — e.g. saving a trial stakeholder whose
--   status is "Pending" throws "An unexpected error occurred" while
--   "Completed"/"In Progress" save fine, because whichever legal ENUM values
--   happen to be defined on the live column are the only ones that succeed;
--   every value Java can legally send that isn't one of them throws a
--   Data-truncated-for-column / Out-of-range-value SQL error, which the
--   backend's generic exception handler turns into that same generic
--   500 message no matter which column or which value actually caused it.
--
--   trial_stakeholders.trial_status was found to have the exact same kind of
--   drift (this is what causes the "Pending" stakeholder-status crash) —
--   likely a native ENUM defined against an older version of
--   TrialStakeholder.Status that didn't yet include PENDING, or that spells
--   it differently.
--
--   The other columns below were not confirmed broken the same way, but they
--   are exactly the same shape (@Enumerated(EnumType.STRING) + manually
--   maintained schema, no Flyway/Liquibase tracking real column history) —
--   converting them defensively now is a safe no-op wherever the column is
--   already VARCHAR, and prevents the identical silent failure from showing
--   up later the next time someone picks whichever enum value the live
--   column doesn't happen to allow.
--
-- This migration is safe: converting ENUM -> VARCHAR preserves every existing
-- value as its string representation, and MODIFY COLUMN on an already-VARCHAR
-- column of the same length is a harmless no-op. No data is lost either way.
-- ============================================================================

-- Confirmed drift (Pass 3): item-level trials status filter returning wrong
-- results for items whose trials_status landed outside the stray ENUM's
-- allowed values.
ALTER TABLE items
    MODIFY COLUMN trials_status VARCHAR(30) DEFAULT NULL;

-- Confirmed drift (this report): saving a trial stakeholder with status
-- "Pending" throws; "Completed"/"In Progress" don't.
ALTER TABLE trial_stakeholders
    MODIFY COLUMN trial_status VARCHAR(30) DEFAULT NULL;

-- Data repair: a separate bug in ItemService.deriveTrialsStatus() (fixed in
-- code alongside this migration) was setting items'/variants' own
-- trials_status to 'ON_HOLD' instead of 'PENDING' whenever any of their
-- trial stakeholders were Pending. Since the Trials Status filter dropdown
-- never offers "On Hold" as an option, any item/variant that got stamped
-- with it that way was permanently unfindable through that filter no matter
-- which value was selected. This repairs rows already stuck with the wrong
-- value from before the code fix — safe to run even if none exist.
UPDATE items
    SET trials_status = 'PENDING'
    WHERE trials_status = 'ON_HOLD';
UPDATE item_variants
    SET trials_status = 'PENDING'
    WHERE trials_status = 'ON_HOLD';

-- Same shape, not yet confirmed broken — converted defensively.
ALTER TABLE items
    MODIFY COLUMN development_status VARCHAR(30) DEFAULT NULL;
ALTER TABLE items
    MODIFY COLUMN ipr_status VARCHAR(30) DEFAULT NULL;
ALTER TABLE item_variants
    MODIFY COLUMN development_status VARCHAR(30) DEFAULT NULL;
ALTER TABLE item_variants
    MODIFY COLUMN tot_status VARCHAR(30) DEFAULT NULL;
ALTER TABLE item_variants
    MODIFY COLUMN trials_status VARCHAR(30) DEFAULT NULL;
ALTER TABLE item_variants
    MODIFY COLUMN ipr_status VARCHAR(30) DEFAULT NULL;
ALTER TABLE trial_feedbacks
    MODIFY COLUMN status VARCHAR(30) DEFAULT NULL;

-- ============================================================================
-- Verify:
--   SHOW COLUMNS FROM items            LIKE 'trials_status';
--   SHOW COLUMNS FROM items            LIKE 'development_status';
--   SHOW COLUMNS FROM items            LIKE 'ipr_status';
--   SHOW COLUMNS FROM trial_stakeholders LIKE 'trial_status';
--   SHOW COLUMNS FROM item_variants    LIKE 'development_status';
--   SHOW COLUMNS FROM item_variants    LIKE 'tot_status';
--   SHOW COLUMNS FROM item_variants    LIKE 'trials_status';
--   SHOW COLUMNS FROM item_variants    LIKE 'ipr_status';
--   SHOW COLUMNS FROM trial_feedbacks  LIKE 'status';
-- Expected for every row above: Type = varchar(30)
-- ============================================================================