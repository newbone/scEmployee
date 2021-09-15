package com.sccodefactory.employee.repository.search;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;

/**
 * Configure a Mock version of {@link VacationSearchRepository} to test the
 * application without starting Elasticsearch.
 */
@Configuration
public class VacationSearchRepositoryMockConfiguration {

    @MockBean
    private VacationSearchRepository mockVacationSearchRepository;
}
