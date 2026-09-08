package com.ims.controller;

import com.ims.dto.ApiResponse;
import com.ims.dto.ItemDTO;
import com.ims.dto.ItemVariantDTO;
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

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

    /*
     * ── DELETE image ──
     * The image is shared by the item and every one of its variants, so this
     * removes it everywhere at once, rather than being scoped to whichever
     * variant's edit screen the request came from.
     */
    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Remove the item's image (also removes it from every variant, since it's a shared asset)")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> deleteImage(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.deleteImage(id)));
    }

    /* ── UPLOAD variant image ── */
    @PostMapping(value = "/{id}/variants/{variantId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Upload an image for a specific variant")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> uploadVariantImage(
            @PathVariable Long id,
            @PathVariable Long variantId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(itemService.uploadVariantImage(id, variantId, file)));
    }

    /* ── UPLOAD document ── */
    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Upload a document file for an item")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> uploadDocument(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(itemService.uploadDocument(id, name, file)));
    }

    /* ── DELETE document ── */
    @DeleteMapping("/{id}/documents/{docId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Delete an uploaded document from an item")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> deleteDocument(
            @PathVariable Long id,
            @PathVariable Long docId) {
        return ResponseEntity.ok(ApiResponse.success(itemService.deleteDocument(id, docId)));
    }

    /*
     * ── UPLOAD variant document ──
     * Previously missing entirely — the variant edit screen had no choice
     * but to call the item-level /documents endpoint above, which attaches
     * the file to the item rather than the variant. Since a variant's
     * Documentation tab only ever reads documents scoped to its own id, an
     * upload made while editing a variant would report success but never
     * actually show up there. This is the real variant-scoped endpoint.
     */
    @PostMapping(value = "/{id}/variants/{variantId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Upload a document file for a specific variant")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> uploadVariantDocument(
            @PathVariable Long id,
            @PathVariable Long variantId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(itemService.uploadVariantDocument(id, variantId, name, file)));
    }

    /* ── DELETE variant document ── */
    @DeleteMapping("/{id}/variants/{variantId}/documents/{docId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Delete an uploaded document from a specific variant")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> deleteVariantDocument(
            @PathVariable Long id,
            @PathVariable Long variantId,
            @PathVariable Long docId) {
        return ResponseEntity.ok(ApiResponse.success(itemService.deleteVariantDocument(id, variantId, docId)));
    }

    /* ── CONVERT item to variants (existing details become Variant 1) ── */
    @PostMapping("/{id}/variants/convert")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Convert an item without variants into one with a first variant, "
            + "moving its existing details across without losing anything")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> convertToVariant(
            @PathVariable Long id,
            @RequestBody ItemVariantDTO.ConvertRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Item converted to variants", itemService.convertToVariant(id, request)));
    }

    /* ── ADD variant (blank, or copied from an existing variant) ── */
    @PostMapping("/{id}/variants")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Add a new variant to an item — blank or copied from an existing variant")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> createVariant(
            @PathVariable Long id,
            @RequestBody ItemVariantDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(itemService.createVariant(id, request)));
    }

    /* ── GET single variant's full independent detail (all tabs) ── */
    @GetMapping("/{id}/variants/{variantId}")
    @Operation(summary = "Get a variant's full independent detail across every tab")
    public ResponseEntity<ApiResponse<ItemVariantDTO>> getVariantDetail(
            @PathVariable Long id,
            @PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getVariantDetail(id, variantId)));
    }

    /* ── UPDATE variant (full independent data across every tab) ── */
    @PutMapping("/{id}/variants/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Update a variant's full independent data")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> updateVariant(
            @PathVariable Long id,
            @PathVariable Long variantId,
            @RequestBody ItemVariantDTO variant) {
        return ResponseEntity.ok(ApiResponse.success(itemService.updateVariant(id, variantId, variant)));
    }

    /* ── DELETE variant ── */
    @DeleteMapping("/{id}/variants/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Delete a variant from an item")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> deleteVariant(
            @PathVariable Long id,
            @PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success(itemService.deleteVariant(id, variantId)));
    }

    /*
     * ── ARCHIVE variant (soft-delete fallback when deleteVariant is blocked
     * by related documents/procurement/trial records) ──
     */
    @PatchMapping("/{id}/variants/{variantId}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Archive a variant instead of deleting it, keeping its related records intact")
    public ResponseEntity<ApiResponse<ItemDTO.Response>> archiveVariant(
            @PathVariable Long id,
            @PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Variant archived", itemService.archiveVariant(id, variantId)));
    }
}