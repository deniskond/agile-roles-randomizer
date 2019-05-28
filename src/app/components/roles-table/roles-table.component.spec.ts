import { DataStorageService } from '../../services/data-storage/data-storage.service';
import { CdkTableModule } from '@angular/cdk/table';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesTableComponent } from './roles-table.component';
import { AppMaterialModule } from '../../app.material.module';
import { FormsModule } from '@angular/forms';

describe('RolesTableComponent', () => {
    let component: RolesTableComponent;
    let fixture: ComponentFixture<RolesTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [AppMaterialModule, FormsModule, CdkTableModule],
            declarations: [RolesTableComponent],
            providers: [DataStorageService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RolesTableComponent);
        component = fixture.componentInstance;
        component.teamMembers = [];
        component.roles = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
