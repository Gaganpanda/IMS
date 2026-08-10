package com.ims.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converts {@link Item.ToTStatus} to/from the database column.
 *
 * The ToT status model used to have 4 values (FILLED_TNF, FILLED_TAC,
 * TO_BE_FILLED, NOT_APPLICABLE) and was simplified down to just FILED and
 * TO_BE_FILED. Existing rows in the database may still contain the old
 * constant names. Using a converter (instead of @Enumerated(EnumType.STRING))
 * means those legacy rows are normalized on read instead of throwing
 * IllegalArgumentException when Hibernate tries to load them.
 */
@Converter
public class ToTStatusConverter implements AttributeConverter<Item.ToTStatus, String> {

    @Override
    public String convertToDatabaseColumn(Item.ToTStatus status) {
        return status == null ? null : status.name();
    }

    @Override
    public Item.ToTStatus convertToEntityAttribute(String dbValue) {
        if (dbValue == null || dbValue.isBlank()) return null;
        return switch (dbValue.trim().toUpperCase()) {
            case "FILED", "FILLED_TNF", "FILLED_TAC", "FILLED" -> Item.ToTStatus.FILED;
            case "TO_BE_FILED", "TO_BE_FILLED"                  -> Item.ToTStatus.TO_BE_FILED;
            case "NOT_APPLICABLE"                               -> Item.ToTStatus.TO_BE_FILED;
            default -> {
                try { yield Item.ToTStatus.valueOf(dbValue.trim().toUpperCase()); }
                catch (IllegalArgumentException e) { yield null; }
            }
        };
    }
}
