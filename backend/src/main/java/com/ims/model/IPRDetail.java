package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ipr_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IPRDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean patentFiled;
    private Boolean patentGranted;
    private String patentNumber;
    private String patentGrantedNumber;

    private Boolean trademarkFiled;
    private Boolean trademarkGranted;
    private String trademarkNumber;
    private String trademarkGrantedNumber;

    private Boolean designFiled;
    private Boolean designGranted;
    private String designNumber;
    private String designGrantedNumber;

    @OneToOne
    @JoinColumn(name = "item_id")
    private Item item;
}