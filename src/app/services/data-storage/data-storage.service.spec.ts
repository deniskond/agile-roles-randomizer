import { TestBed } from '@angular/core/testing';
import { DataStorageService } from './data-storage.service';

describe('DataStorageService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [DataStorageService],
    }));

    it('should be created', () => {
        const service: DataStorageService = TestBed.get(DataStorageService);
        expect(service).toBeTruthy();
    });
});
