jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CountryService } from '../service/country.service';

import { CountryComponent } from './country.component';

describe('Component Tests', () => {
  describe('Country Management Component', () => {
    let comp: CountryComponent;
    let fixture: ComponentFixture<CountryComponent>;
    let service: CountryService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [CountryComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { queryParams: {} } },
          },
        ],
      })
        .overrideTemplate(CountryComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(CountryComponent);
      comp = fixture.componentInstance;
      service = TestBed.inject(CountryService);

      const headers = new HttpHeaders().append('link', 'link;link');
      jest.spyOn(service, 'query').mockReturnValue(
        of(
          new HttpResponse({
            body: [{ id: 123 }],
            headers,
          })
        )
      );
    });

    it('Should call load all on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.countries?.[0]).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
