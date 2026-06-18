package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tot_partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToTPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String partnerName;

    private Boolean totCertificate;

    private Boolean sampleSubmittedForTac;

    private Boolean latotSignature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
}