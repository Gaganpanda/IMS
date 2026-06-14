package com.ims.controller;

import com.ims.dto.ApiResponse;
import com.ims.dto.ItemDTO;
import com.ims.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
@Tag(name = "Items", description = "Item management endpoints")
public class ItemController {

    private final ItemService itemService;

    /* ── GET all items (with filters + pagination) ── */
    @GetMapping
    @Operation(summary = "Get all items with optional filters and pagination")
    public ResponseEntity<ApiResponse<Page<ItemDTO.Summary>>> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String developmentStatus,
            @RequestParam(required = false) String totStatus,
            @RequestParam(required = false) String iprStatus,
            @RequestParam(required = false) String trialsStatus,
            @RequestParam(defaultValue = "0")          int    page,
            @RequestParam(defaultValue = "6")          int    size,
            @RequestParam(defaultValue = "updatedAt")  String sortBy,
            @RequestParam(defaultValue = "desc")       String sortDir) {

        Page<ItemDTO.Summary> result = itemService.getAllItems(
            search, category, developmentStatus, totStatus,
            iprStatus, trialsStatus, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /* ── GET single item ── */
    @GetMapping("/{id}")
    @Operation(summary = "Get item by ID")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> getItemById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getItemById(id)));
    }

    /* ── CREATE item ── */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Create a new item")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> createItem(
            @Valid @RequestBody ItemDTO.Request request) {
        ItemDTO.Response created = itemService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item created successfully", created));
    }

    /* ── UPDATE item ── */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Update an existing item")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemDTO.Request request) {
        ItemDTO.Response updated = itemService.updateItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Item updated successfully", updated));
    }

    /* ── DELETE item ── */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an item (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deleted successfully", null));
    }

    /* ── UPLOAD image ── */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Upload item image")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(itemService.uploadImage(id, file)));
    }
}
