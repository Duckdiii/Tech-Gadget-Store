package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("brands")
public class Brand {
    @Id
    private UUID id;
    private String name;
    private String slug;
    @Column("logo_url")
    private String logoUrl;
}
