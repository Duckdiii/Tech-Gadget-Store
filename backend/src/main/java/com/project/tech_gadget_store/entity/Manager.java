package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "managers")
@DiscriminatorValue("MANAGER")
@Getter
@Setter
public class Manager extends User {
}
