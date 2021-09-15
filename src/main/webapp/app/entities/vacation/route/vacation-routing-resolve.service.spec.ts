jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IVacation, Vacation } from '../vacation.model';
import { VacationService } from '../service/vacation.service';

import { VacationRoutingResolveService } from './vacation-routing-resolve.service';

describe('Service Tests', () => {
  describe('Vacation routing resolve service', () => {
    let mockRouter: Router;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let routingResolveService: VacationRoutingResolveService;
    let service: VacationService;
    let resultVacation: IVacation | undefined;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Router, ActivatedRouteSnapshot],
      });
      mockRouter = TestBed.inject(Router);
      mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
      routingResolveService = TestBed.inject(VacationRoutingResolveService);
      service = TestBed.inject(VacationService);
      resultVacation = undefined;
    });

    describe('resolve', () => {
      it('should return IVacation returned by find', () => {
        // GIVEN
        service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultVacation = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultVacation).toEqual({ id: 123 });
      });

      it('should return new IVacation if id is not provided', () => {
        // GIVEN
        service.find = jest.fn();
        mockActivatedRouteSnapshot.params = {};

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultVacation = result;
        });

        // THEN
        expect(service.find).not.toBeCalled();
        expect(resultVacation).toEqual(new Vacation());
      });

      it('should route to 404 page if data not found in server', () => {
        // GIVEN
        jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Vacation })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultVacation = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultVacation).toEqual(undefined);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
      });
    });
  });
});
