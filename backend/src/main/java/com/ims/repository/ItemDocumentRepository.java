package com.ims.repository;

import com.ims.model.ItemDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemDocumentRepository extends JpaRepository<ItemDocument, Long> {
    List<ItemDocument> findByItemId(Long itemId);

    List<ItemDocument> findByItemIdOrderByUploadedAtDesc(Long itemId);

    List<ItemDocument> findByItemVariantId(Long variantId);

    List<ItemDocument> findByItemVariantIdOrderByUploadedAtDesc(Long variantId);
}
