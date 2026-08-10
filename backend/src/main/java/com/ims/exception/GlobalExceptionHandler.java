package com.ims.exception;

import java.util.HashMap;
import java.util.Map;

import org.apache.catalina.connector.ClientAbortException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.ims.dto.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /* ── 400 Validation ── */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(err -> {
            String field   = ((FieldError) err).getField();
            String message = err.getDefaultMessage();
            errors.put(field, message);
        });
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(errors)
                        .build());
    }

    /* ── 400 Illegal arguments ── */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage()));
    }

    /* ── 401 Bad credentials ── */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password"));
    }

    /* ── 423 Account locked (too many failed login attempts) ── */
    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccountLocked(AccountLockedException ex) {
        return ResponseEntity.status(HttpStatus.LOCKED)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /* ── 403 Account disabled by an administrator ── */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabled(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /* ── 429 Too many login requests from this client ── */
    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ApiResponse<Void>> handleTooManyRequests(TooManyRequestsException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /* ── 403 Forbidden ── */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You do not have permission to perform this action"));
    }

    /* ── 404 Not found (application resources, e.g. Item by id) ── */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /*
     * ── 404 Not found (static resources, e.g. missing /uploads/{file} image) ──
     *
     * Spring Framework 6.1+ throws NoResourceFoundException (instead of silently
     * 404ing) when a static resource handler (see WebConfig's "/uploads/**"
     * mapping) can't find the requested file. Without this handler, that
     * exception falls through to handleGeneric(Exception) below — but by then
     * the response Content-Type has already been negotiated as the image's
     * MIME type (e.g. image/png), so writing a JSON ApiResponse body into it
     * fails with a secondary HttpMessageNotWritableException ("No converter
     * for ApiResponse with preset Content-Type 'image/png'"), producing a
     * confusing 500 instead of a clean 404.
     *
     * Declaring this handler fixes that: Spring's @ExceptionHandler resolution
     * always prefers the most specific matching exception type, so this takes
     * priority over handleGeneric(Exception) for NoResourceFoundException
     * regardless of method order.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleMissingStaticResource(NoResourceFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    /* ── 409 Duplicate ── */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateKey(DataIntegrityViolationException ex) {
        String message = "A record with this value already exists";
        if (ex.getMessage() != null && ex.getMessage().contains("code")) {
            message = "An item with this code already exists";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(message));
    }

    /* ── 413 File too large ── */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error("File size exceeds the maximum allowed limit (5MB)"));
    }

    /*
     * ── Client disconnected mid-response (e.g. page refreshed or navigated away
     * while an image was still streaming) ──
     *
     * ClientAbortException (wrapping a "Broken pipe" IOException) means the
     * browser already closed the connection — there is no socket left to write
     * an error response to. Attempting to write one just fails again with the
     * same HttpMessageNotWritableException we're trying to avoid. This is
     * normal, harmless browser behavior (a cancelled request from a refresh or
     * navigation), not an application error, so we log it quietly at DEBUG and
     * skip writing a response entirely.
     *
     * Deliberately scoped to ClientAbortException specifically (not the broader
     * IOException) so genuine IOExceptions elsewhere — e.g. a disk error during
     * image upload in ItemController#uploadImage — still fall through to
     * handleGeneric below and return a proper error response instead of being
     * silently swallowed.
     */
    @ExceptionHandler(ClientAbortException.class)
    public void handleClientAbort(ClientAbortException ex) {
        log.debug("Client disconnected before response could be written: {}", ex.getMessage());
        // Intentionally no response body — the client is already gone.
    }

    /* ── 500 Generic ── */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        // ClientAbortException extends IOException but Spring's exception-handler
        // resolution matches the most specific declared type in this class, so
        // genuine broken-pipe cases are already caught by handleClientAbort above.
        // Anything reaching here is a real server-side error.
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
    }
}