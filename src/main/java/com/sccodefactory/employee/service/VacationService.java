package com.sccodefactory.employee.service;

import com.sccodefactory.employee.domain.Vacation;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link Vacation}.
 */
public interface VacationService {
    /**
     * Save a vacation.
     *
     * @param vacation the entity to save.
     * @return the persisted entity.
     */
    Vacation save(Vacation vacation);

    /**
     * Partially updates a vacation.
     *
     * @param vacation the entity to update partially.
     * @return the persisted entity.
     */
    Optional<Vacation> partialUpdate(Vacation vacation);

    /**
     * Get all the vacations.
     *
     * @return the list of entities.
     */
    List<Vacation> findAll();

    /**
     * Get the "id" vacation.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<Vacation> findOne(Long id);

    /**
     * Delete the "id" vacation.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Search for the vacation corresponding to the query.
     *
     * @param query the query of the search.
     * @return the list of entities.
     */
    List<Vacation> search(String query);
}
