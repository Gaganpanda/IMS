package com.ims.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDocumentDTO {

    private Long id;

    private String docName;

    private String originalFileName;

    private String fileUrl;

    private LocalDateTime uploadedAt;
}
