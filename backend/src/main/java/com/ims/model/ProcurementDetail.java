package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "procurement_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcurementDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* Procurement Agency (formerly "organisationName") */
    private String procurementAgency;

    /* ToT Firm No linked to this procurement entry */
    private String totFirmNo;

    /* Number of items procured */
    private Integer noOfItemProcured;

    /* Production value (kept as text to allow currency formatting, e.g. "₹12,50,000") */
    private String productionValue;

    private String orderNumber;

    private LocalDate orderDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    /* Set when this procurement entry belongs to a specific variant instead
     * of the base item directly — exactly one of item/itemVariant is non-null. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ItemVariant itemVariant;
}