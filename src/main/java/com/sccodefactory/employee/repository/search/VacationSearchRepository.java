package com.sccodefactory.employee.repository.search;

import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;

import com.sccodefactory.employee.domain.Vacation;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Vacation} entity.
 */
public interface VacationSearchRepository extends ElasticsearchRepository<Vacation, Long>, VacationSearchRepositoryInternal {}

interface VacationSearchRepositoryInternal {
    Stream<Vacation> search(String query);
}

class VacationSearchRepositoryInternalImpl implements VacationSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    VacationSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Stream<Vacation> search(String query) {
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(queryStringQuery(query));
        return elasticsearchTemplate.search(nativeSearchQuery, Vacation.class).map(SearchHit::getContent).stream();
    }
}
