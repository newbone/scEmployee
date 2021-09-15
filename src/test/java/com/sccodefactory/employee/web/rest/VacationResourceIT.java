package com.sccodefactory.employee.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.sccodefactory.employee.IntegrationTest;
import com.sccodefactory.employee.domain.Vacation;
import com.sccodefactory.employee.repository.VacationRepository;
import com.sccodefactory.employee.repository.search.VacationSearchRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Stream;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link VacationResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class VacationResourceIT {

    private static final Instant DEFAULT_START_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_START_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_END_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_END_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/vacations";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/_search/vacations";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private VacationRepository vacationRepository;

    /**
     * This repository is mocked in the com.sccodefactory.employee.repository.search test package.
     *
     * @see com.sccodefactory.employee.repository.search.VacationSearchRepositoryMockConfiguration
     */
    @Autowired
    private VacationSearchRepository mockVacationSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restVacationMockMvc;

    private Vacation vacation;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Vacation createEntity(EntityManager em) {
        Vacation vacation = new Vacation().startDate(DEFAULT_START_DATE).endDate(DEFAULT_END_DATE);
        return vacation;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Vacation createUpdatedEntity(EntityManager em) {
        Vacation vacation = new Vacation().startDate(UPDATED_START_DATE).endDate(UPDATED_END_DATE);
        return vacation;
    }

    @BeforeEach
    public void initTest() {
        vacation = createEntity(em);
    }

    @Test
    @Transactional
    void createVacation() throws Exception {
        int databaseSizeBeforeCreate = vacationRepository.findAll().size();
        // Create the Vacation
        restVacationMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(vacation)))
            .andExpect(status().isCreated());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeCreate + 1);
        Vacation testVacation = vacationList.get(vacationList.size() - 1);
        assertThat(testVacation.getStartDate()).isEqualTo(DEFAULT_START_DATE);
        assertThat(testVacation.getEndDate()).isEqualTo(DEFAULT_END_DATE);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(1)).save(testVacation);
    }

    @Test
    @Transactional
    void createVacationWithExistingId() throws Exception {
        // Create the Vacation with an existing ID
        vacation.setId(1L);

        int databaseSizeBeforeCreate = vacationRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restVacationMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(vacation)))
            .andExpect(status().isBadRequest());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeCreate);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(0)).save(vacation);
    }

    @Test
    @Transactional
    void getAllVacations() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        // Get all the vacationList
        restVacationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(vacation.getId().intValue())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())));
    }

    @Test
    @Transactional
    void getVacation() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        // Get the vacation
        restVacationMockMvc
            .perform(get(ENTITY_API_URL_ID, vacation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(vacation.getId().intValue()))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingVacation() throws Exception {
        // Get the vacation
        restVacationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewVacation() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();

        // Update the vacation
        Vacation updatedVacation = vacationRepository.findById(vacation.getId()).get();
        // Disconnect from session so that the updates on updatedVacation are not directly saved in db
        em.detach(updatedVacation);
        updatedVacation.startDate(UPDATED_START_DATE).endDate(UPDATED_END_DATE);

        restVacationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedVacation.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedVacation))
            )
            .andExpect(status().isOk());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);
        Vacation testVacation = vacationList.get(vacationList.size() - 1);
        assertThat(testVacation.getStartDate()).isEqualTo(UPDATED_START_DATE);
        assertThat(testVacation.getEndDate()).isEqualTo(UPDATED_END_DATE);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository).save(testVacation);
    }

    @Test
    @Transactional
    void putNonExistingVacation() throws Exception {
        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();
        vacation.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVacationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, vacation.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(vacation))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(0)).save(vacation);
    }

    @Test
    @Transactional
    void putWithIdMismatchVacation() throws Exception {
        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();
        vacation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVacationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(vacation))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(0)).save(vacation);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamVacation() throws Exception {
        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();
        vacation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVacationMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(vacation)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(0)).save(vacation);
    }

    @Test
    @Transactional
    void partialUpdateVacationWithPatch() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();

        // Update the vacation using partial update
        Vacation partialUpdatedVacation = new Vacation();
        partialUpdatedVacation.setId(vacation.getId());

        partialUpdatedVacation.startDate(UPDATED_START_DATE).endDate(UPDATED_END_DATE);

        restVacationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVacation.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedVacation))
            )
            .andExpect(status().isOk());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);
        Vacation testVacation = vacationList.get(vacationList.size() - 1);
        assertThat(testVacation.getStartDate()).isEqualTo(UPDATED_START_DATE);
        assertThat(testVacation.getEndDate()).isEqualTo(UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void fullUpdateVacationWithPatch() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();

        // Update the vacation using partial update
        Vacation partialUpdatedVacation = new Vacation();
        partialUpdatedVacation.setId(vacation.getId());

        partialUpdatedVacation.startDate(UPDATED_START_DATE).endDate(UPDATED_END_DATE);

        restVacationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVacation.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedVacation))
            )
            .andExpect(status().isOk());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);
        Vacation testVacation = vacationList.get(vacationList.size() - 1);
        assertThat(testVacation.getStartDate()).isEqualTo(UPDATED_START_DATE);
        assertThat(testVacation.getEndDate()).isEqualTo(UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void patchNonExistingVacation() throws Exception {
        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();
        vacation.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVacationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, vacation.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(vacation))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(0)).save(vacation);
    }

    @Test
    @Transactional
    void patchWithIdMismatchVacation() throws Exception {
        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();
        vacation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVacationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(vacation))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(0)).save(vacation);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamVacation() throws Exception {
        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();
        vacation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVacationMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(vacation)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Vacation in the database
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(0)).save(vacation);
    }

    @Test
    @Transactional
    void deleteVacation() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        int databaseSizeBeforeDelete = vacationRepository.findAll().size();

        // Delete the vacation
        restVacationMockMvc
            .perform(delete(ENTITY_API_URL_ID, vacation.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Vacation> vacationList = vacationRepository.findAll();
        assertThat(vacationList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the Vacation in Elasticsearch
        verify(mockVacationSearchRepository, times(1)).deleteById(vacation.getId());
    }

    @Test
    @Transactional
    void searchVacation() throws Exception {
        // Configure the mock search repository
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);
        when(mockVacationSearchRepository.search("id:" + vacation.getId())).thenReturn(Stream.of(vacation));

        // Search the vacation
        restVacationMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + vacation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(vacation.getId().intValue())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())));
    }
}
