package com.ims.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Self-healing schema fix, run once on every startup, right after Hibernate's
 * own ddl-auto=update pass.
 *
 * Root cause this addresses: some deployments were first created from an
 * older copy of schema.sql (or had columns widened later in the Java model
 * without a matching manual ALTER on the live database). Hibernate's
 * ddl-auto=update does not reliably widen an already-existing VARCHAR column
 * on every dialect/version combination, so a database created back when
 * {@code notifications.type} was narrower can be left stuck with the old,
 * too-small column width even though the current {@code Notification}
 * entity/schema.sql both declare VARCHAR(50).
 *
 * That mismatch is exactly what produced the recurring
 * "Data truncated for column 'type' at row 1" crash: every attempt to save
 * an item/variant that generates a longer notification type value (e.g.
 * FEEDBACK_RECEIVED, FEEDBACK_OVERDUE) failed the INSERT, which — because it
 * ran inside the same @Transactional method as the rest of the item/variant
 * save — rolled back the *entire* save (trial stakeholders, dates, etc.),
 * making it look like a "trial stakeholder / dates" bug from the outside.
 *
 * This runner defensively (and idempotently) re-asserts the column width on
 * every boot, regardless of the database's history, so the app self-heals
 * without needing a manual migration step. It is deliberately silent/no-op
 * on failure (e.g. insufficient DB privileges) rather than preventing
 * startup — schema repair is a best-effort convenience, not a hard
 * dependency.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SchemaRepairRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        widenColumnIfNeeded("notifications", "type", "VARCHAR(50) NULL");
        widenColumnIfNeeded("notifications", "sample_no", "VARCHAR(100) NULL");
        widenColumnIfNeeded("notifications", "title", "VARCHAR(100) NOT NULL");
        widenColumnIfNeeded("notifications", "message", "VARCHAR(500) NOT NULL");
        widenColumnIfNeeded("notifications", "item_name", "VARCHAR(200) NULL");
    }

    private void widenColumnIfNeeded(String table, String column, String newDefinition) {
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE " + table + " MODIFY COLUMN " + column + " " + newDefinition);
            log.debug("Schema repair: confirmed {}.{} is {}", table, column, newDefinition);
        } catch (Exception e) {
            // Table/column may not exist yet on a brand-new database (Hibernate
            // creates it moments before this runs), or the DB user may lack
            // ALTER privileges — either way, this is best-effort and must never
            // block application startup.
            log.debug("Schema repair skipped for {}.{}: {}", table, column, e.getMessage());
        }
    }
}
