package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    /* ToT Firm */
    @Column(name = "tot_firm", length = 300)
    private String totFirm;

    /* LAToT Signing Date */
    @Column(name = "latot_signing_date")
    private LocalDate latotSigningDate;

    /* Sample submission for Technology Absorption Date */
    @Column(name = "sample_submission_for_tech_absorption_date")
    private LocalDate sampleSubmissionForTechAbsorptionDate;

    /* ToT Certificate Date (date the certificate was received) */
    @Column(name = "tot_certificate_date")
    private LocalDate totCertificateDate;

    /* ToT Validity Date — used to drive renewal notifications */
    @Column(name = "tot_validity_date")
    private LocalDate totValidityDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    /* Set when this partner belongs to a specific variant instead of the
     * base item directly — exactly one of item/itemVariant is non-null. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ItemVariant itemVariant;
}
