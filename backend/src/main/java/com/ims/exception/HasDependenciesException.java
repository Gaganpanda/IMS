package com.ims.exception;

import lombok.Getter;

/**
 * Thrown when a delete is blocked because the record has related child data
 * (documents, procurement records, trial records, ...) that would otherwise
 * be silently cascaded away. Carries the counts so the frontend can show
 * exactly what's attached and offer "Archive instead" (see
 * ItemService#deleteVariant, GlobalExceptionHandler).
 */
@Getter
public class HasDependenciesException extends RuntimeException {
    private final int documentCount;
    private final int procurementCount;
    private final int trialCount;

    public HasDependenciesException(String message, int documentCount, int procurementCount, int trialCount) {
        super(message);
        this.documentCount = documentCount;
        this.procurementCount = procurementCount;
        this.trialCount = trialCount;
    }
}
