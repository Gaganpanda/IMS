package com.ims.exception;

/**
 * Thrown when a client (identified by IP) exceeds the allowed number of
 * login attempts within the rate-limiting window. See
 * {@code com.ims.security.LoginRateLimiter}.
 */
public class TooManyRequestsException extends RuntimeException {

    public TooManyRequestsException(String message) {
        super(message);
    }
}
