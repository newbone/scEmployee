package com.sccodefactory.employee.repository;

import com.sccodefactory.employee.domain.Vacation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Vacation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface VacationRepository extends JpaRepository<Vacation, Long> {}
