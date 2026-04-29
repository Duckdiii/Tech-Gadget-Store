package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Employee;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface EmployeeRepository extends ReactiveCrudRepository<Employee, UUID> {

    Mono<Employee> findByAccountId(UUID accountId);

    Mono<Employee> findByEmployeeCode(String employeeCode);
}
