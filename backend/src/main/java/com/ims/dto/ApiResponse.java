package com.ims.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String  message;
    private T       data;
    private String  error;

    /* Optional machine-readable error code (e.g. "ITEM_STALE",
     * "ITEM_NOT_FOUND") so the frontend can branch on the failure reason
     * instead of pattern-matching the human-readable message string. Omitted
     * from the JSON body when null (see @JsonInclude above) so existing
     * consumers that only read `error`/`message` are unaffected. */
    private String  code;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /* ── Factory methods ── */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String code) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(message)
                .code(code)
                .build();
    }
}
