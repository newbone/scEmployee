package com.sccodefactory.employee.service.impl;

import static org.elasticsearch.index.query.QueryBuilders.*;

import com.sccodefactory.employee.domain.Vacation;
import com.sccodefactory.employee.repository.VacationRepository;
import com.sccodefactory.employee.repository.search.VacationSearchRepository;
import com.sccodefactory.employee.service.VacationService;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Vacation}.
 */
@Service
@Transactional
public class VacationServiceImpl implements VacationService {

    private final Logger log = LoggerFactory.getLogger(VacationServiceImpl.class);

    private final VacationRepository vacationRepository;

    private final VacationSearchRepository vacationSearchRepository;

    public VacationServiceImpl(VacationRepository vacationRepository, VacationSearchRepository vacationSearchRepository) {
        this.vacationRepository = vacationRepository;
        this.vacationSearchRepository = vacationSearchRepository;
    }

    @Override
    public Vacation save(Vacation vacation) {
        log.debug("Request to save Vacation : {}", vacation);
        Vacation result = vacationRepository.save(vacation);
        vacationSearchRepository.save(result);
        return result;
    }

    @Override
    public Optional<Vacation> partialUpdate(Vacation vacation) {
        log.debug("Request to partially update Vacation : {}", vacation);

        return vacationRepository
            .findById(vacation.getId())
            .map(existingVacation -> {
                if (vacation.getStartDate() != null) {
                    existingVacation.setStartDate(vacation.getStartDate());
                }
                if (vacation.getEndDate() != null) {
                    existingVacation.setEndDate(vacation.getEndDate());
                }

                return existingVacation;
            })
            .map(vacationRepository::save)
            .map(savedVacation -> {
                vacationSearchRepository.save(savedVacation);

                return savedVacation;
            });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vacation> findAll() {
        log.debug("Request to get all Vacations");
        return vacationRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Vacation> findOne(Long id) {
        log.debug("Request to get Vacation : {}", id);
        return vacationRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Vacation : {}", id);
        vacationRepository.deleteById(id);
        vacationSearchRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vacation> search(String query) {
        log.debug("Request to search Vacations for query {}", query);
        return StreamSupport.stream(vacationSearchRepository.search(query).spliterator(), false).collect(Collectors.toList());
    }
}
