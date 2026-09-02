package com.urbannest.backend.repository;

import com.urbannest.backend.entity.PropertyPostingFee;
import com.urbannest.backend.entity.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyPostingFeeRepository extends JpaRepository<PropertyPostingFee, PropertyType> {
}
