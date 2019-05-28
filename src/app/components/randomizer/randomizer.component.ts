import { RandomizerModes } from '../../enums/randomizer-modes.enum';
import { ChosenRoleInterface } from '../../interfaces/chosen-role.interface';
import { RolesMapInterface } from '../../interfaces/roles-map.interface';
import { DataStorageService } from '../../services/data-storage/data-storage.service';
import { Component, OnInit } from '@angular/core';
import { MatSelectChange, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { take } from 'rxjs/operators';
import { SlackApiService } from '../../services/slack-api/slack-api.service';

const RANDOMIZE_ITERATIONS_COUNT = 50;
const RANDOMIZE_MILLISECONDS_COUNT = 2;

@Component({
    selector: 'app-randomizer',
    templateUrl: './randomizer.component.html',
    styleUrls: ['./randomizer.component.scss'],
})
export class RandomizerComponent implements OnInit {
    public allTeamMembers: string[];
    public roles: string[];
    public rolesMap: RolesMapInterface[];
    public randomizerMode: RandomizerModes;
    public instantChoice: boolean;
    public slackToken: string;
    public slackChannel: string;

    public checked: Record<string, boolean> = {};
    public lastIterationRoles: Record<string, string> = {};
    public chosenRoles: ChosenRoleInterface[] = [];

    public randomizeCount = 0;
    public randomInProgress = false;

    constructor(private dataStorageService: DataStorageService, private slackApiService: SlackApiService, private snackBar: MatSnackBar, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParams.pipe(take(1)).subscribe(({ data }: Params) => {
            if (data) {
                try {
                    const serviceData = JSON.parse(data);

                    this.dataStorageService.restoreState(serviceData);
                } catch {
                    throw new Error('Cannot parse data JSON - invalid format');
                }
            }

            this.allTeamMembers = this.dataStorageService.teamMembers;
            this.roles = this.dataStorageService.roles;
            this.rolesMap = this.dataStorageService.rolesMap;
            this.randomizerMode = this.dataStorageService.randomizerMode;
            this.instantChoice = this.dataStorageService.instantChoice;
            this.slackToken = this.dataStorageService.slackToken;
            this.slackChannel = this.dataStorageService.slackChannel;

            this.allTeamMembers.forEach(teamMember => (this.checked[teamMember] = true));
        });
    }

    public get checkedTeamMembers(): RolesMapInterface[] {
        return this.rolesMap.filter(({ teamMember }: RolesMapInterface) => this.checked[teamMember]);
    }

    public getTeamMembersForRole(targetRole: string): string[] {
        return this.checkedTeamMembers
            .filter(({ teamMemberRoles }: RolesMapInterface) => teamMemberRoles.some((role: string) => role === targetRole))
            .map(({ teamMember }: RolesMapInterface) => teamMember);
    }

    public onSelectChange({ value }: MatSelectChange, role: string): void {
        this.lastIterationRoles[role] = value;
    }

    public randomize(): void {
        this.randomInProgress = true;

        setTimeout(() => {
            const unsortedChosenRoles = this.getChosenRoles([]);

            this.chosenRoles =
                unsortedChosenRoles.length === this.roles.length
                    ? this.roles.map((role: string) =>
                          unsortedChosenRoles.find((chosenRoles: ChosenRoleInterface) => chosenRoles.role === role),
                      )
                    : [];

            this.randomizeCount++;

            if (!this.instantChoice && this.randomizeCount < RANDOMIZE_ITERATIONS_COUNT) {
                this.randomize();
            } else {
                this.randomizeCount = 0;
                this.randomInProgress = false;

                if (unsortedChosenRoles.length !== this.roles.length) {
                    this.snackBar.open('Невозможно выбрать все роли', 'Недостаточно участников', { duration: 4000 });
                }
            }
        }, RANDOMIZE_MILLISECONDS_COUNT * this.randomizeCount);
    }

    public sendToSlack(): void {
        this.slackApiService.setTopic(this.chosenRoles);
    }

    private roleComparator(role1: string, role2: string): number {
        return this.getTeamMembersForRole(role1).length - this.getTeamMembersForRole(role2).length;
    }

    private getChosenRoles(alreadyChosenRoles: ChosenRoleInterface[]): ChosenRoleInterface[] {
        const remainingRoles = this.roles
            .filter((role: string) => !alreadyChosenRoles.some((chosenRole: ChosenRoleInterface) => chosenRole.role === role))
            .sort(this.roleComparator.bind(this));

        if (!remainingRoles.length) {
            return alreadyChosenRoles;
        }

        const firstRole = remainingRoles[0];
        const teamMembersForRole = this.getTeamMembersForRole(firstRole);
        const notChosenTeamMembers = this.filterByNotChosen(teamMembersForRole, alreadyChosenRoles);
        const membersFilteredByRandomizerMode = this.filterByRandomizerMode(firstRole, notChosenTeamMembers, this.randomizerMode);
        const chosenTeamMember = this.getRandomMember(membersFilteredByRandomizerMode);

        if (chosenTeamMember) {
            alreadyChosenRoles.push({
                role: firstRole,
                teamMember: chosenTeamMember,
            });
        } else {
            return alreadyChosenRoles;
        }

        return this.getChosenRoles(alreadyChosenRoles);
    }

    private getRandomMember<T>(teamMembers: T[]): T {
        return teamMembers[Math.floor(Math.random() * teamMembers.length)];
    }

    private filterByRandomizerMode(role: string, teamMembers: string[], randomizerMode: RandomizerModes): string[] {
        switch (randomizerMode) {
            case RandomizerModes.NEW_MEMBERS_FOR_ITERATION:
                return teamMembers.filter((teamMember: string) => !this.wasAlreadySelectedLastIteration(teamMember));
            case RandomizerModes.NEW_MEMBERS_FOR_ROLE:
                return teamMembers.filter((teamMember: string) => this.lastIterationRoles[role] !== teamMember);
            default:
                return teamMembers;
        }
    }

    private filterByNotChosen(teamMembers: string[], chosenMembers: ChosenRoleInterface[]): string[] {
        return teamMembers.filter(
            (teamMember: string) => !chosenMembers.some((chosenRole: ChosenRoleInterface) => chosenRole.teamMember === teamMember),
        );
    }

    private wasAlreadySelectedLastIteration(teamMember: string): boolean {
        return Object.keys(this.lastIterationRoles)
            .map((key: string) => this.lastIterationRoles[key])
            .includes(teamMember);
    }
}
