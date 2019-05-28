import { RolesMapInterface } from '../../interfaces/roles-map.interface';
import { DataStorageService } from '../../services/data-storage/data-storage.service';
import { Component, Input, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { uniq } from 'lodash';

@Component({
    selector: 'app-roles-table',
    templateUrl: './roles-table.component.html',
    styleUrls: ['./roles-table.component.scss'],
})
export class RolesTableComponent implements OnInit, OnChanges {
    @Input()
    teamMembers: string[];
    @Input()
    roles: string[];

    public filteredTeamMembers: string[];
    public filteredRoles: string[];
    public columns: string[];
    public rolesTableCheckboxesState: boolean[][];

    constructor(private dataService: DataStorageService) {}

    ngOnInit(): void {
        this.rolesTableCheckboxesState = this.dataService.rolesMap.map(({ teamMemberRoles }: RolesMapInterface) =>
            this.roles.map((role: string) => teamMemberRoles.includes(role)),
        );
    }

    ngOnChanges({ teamMembers, roles }: SimpleChanges): void {
        if (teamMembers && teamMembers.currentValue) {
            this.filteredTeamMembers = uniq(teamMembers.currentValue.filter(member => !!member));
            this.saveStateToService();
        }

        if (roles && roles.currentValue) {
            this.filteredRoles = uniq(roles.currentValue.filter(role => !!role));
            this.columns = ['name', ...this.filteredRoles];
            this.saveStateToService();
        }
    }

    public onCheckBoxChange(i: number, j: number): void {
        if (!this.rolesTableCheckboxesState[i]) {
            this.rolesTableCheckboxesState[i] = new Array(this.roles.length).fill(false);
        }

        this.rolesTableCheckboxesState[i][j] = !this.rolesTableCheckboxesState[i][j];
        this.saveStateToService();
    }

    private saveStateToService(): void {
        if (!this.filteredTeamMembers || !this.filteredRoles || !this.rolesTableCheckboxesState) {
            return;
        }

        const rolesMap = this.filteredTeamMembers.map((teamMember: string, memberIndex: number) => {
            const teamMemberRoles = this.filteredRoles.filter((role: string, roleIndex: number) =>
                this.rolesTableCheckboxesState[memberIndex] ? this.rolesTableCheckboxesState[memberIndex][roleIndex] : false,
            );

            return {
                teamMember,
                teamMemberRoles,
            };
        });

        this.dataService.rolesMap = rolesMap;
        this.dataService.roles = this.filteredRoles;
        this.dataService.teamMembers = this.filteredTeamMembers;
        this.dataService.updateState();
    }
}
