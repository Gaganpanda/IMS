package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* The document label/category, e.g. "Technical Specification / QR" or a custom name */
    @Column(name = "doc_name", length = 200)
    private String docName;

    /* The randomised name the file is actually stored under on disk */
    @Column(name = "stored_file_name", length = 300)
    private String storedFileName;

    /* The original file name as uploaded by the user */
    @Column(name = "original_file_name", length = 300)
    private String originalFileName;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    /* Set when this document belongs to a specific variant instead of the
     * base item directly — exactly one of item/itemVariant is non-null. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ItemVariant itemVariant;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
