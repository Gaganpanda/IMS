package com.ims.exception;

/**
 * Thrown when a client submits an update built from a stale copy of a
 * record — i.e. someone else saved changes to the same item/variant after
 * the client loaded it. Mapped to HTTP 409 by GlobalExceptionHandler with
 * code ITEM_STALE, so the frontend can show a "someone else changed this,
 * please refresh" conflict screen instead of silently overwriting their
 * changes (see item-update.md / IMS-AddItem-redesign.zip section 9).
 */
public class StaleDataException extends RuntimeException {
    public StaleDataException(String message) {
        super(message);
    }
}
