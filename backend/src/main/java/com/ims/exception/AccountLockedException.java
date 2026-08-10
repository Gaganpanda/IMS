package com.ims.exception;

/**
 * Thrown by {@link com.ims.service.AuthService} when a login is attempted
 * against an account that is currently locked out due to too many
 * consecutive failed attempts. Carries the remaining lock time so the
 * client can show a precise, user-friendly message.
 */
public class AccountLockedException extends RuntimeException {

    public AccountLockedException(String message) {
        super(message);
    }
}
