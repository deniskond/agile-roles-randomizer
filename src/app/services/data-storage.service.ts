import { DataStorageInterface } from '../interfaces/data-storage.interface';
import { RandomizerModes } from '../enums/randomizer-modes.enum';
import { RolesMapInterface } from '../interfaces/roles-map.interface';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const defaultRoles: string[] = ['Scrum Master', 'Release Manager'];
const defaultTeamMembers: string[] = ['Name 1', 'Name 2', 'Name 3'];
const defaultRolesMap: RolesMapInterface[] = [
    {
        teamMember: 'Name 1',
        teamMemberRoles: ['Scrum Master', 'Release Manager'],
    },
    {
        teamMember: 'Name 2',
        teamMemberRoles: ['Scrum Master', 'Release Manager'],
    },
    {
        teamMember: 'Name 3',
        teamMemberRoles: ['Scrum Master', 'Release Manager'],
    },
];
const defaultRandomizerMode = RandomizerModes.NEW_MEMBERS_FOR_ITERATION;
const defaultInstantChoice = false;

@Injectable()
export class DataStorageService {
    private _rolesMap: RolesMapInterface[];
    private _teamMembers: string[];
    private _roles: string[];
    private _randomizerMode: RandomizerModes;
    private _instantChoice: boolean;
    private _state = new BehaviorSubject<DataStorageInterface>(null);

    public get rolesMap(): RolesMapInterface[] {
        return this._rolesMap || defaultRolesMap;
    }

    public set rolesMap(rolesMap: RolesMapInterface[]) {
        this._rolesMap = rolesMap;
    }

    public get teamMembers(): string[] {
        return this._teamMembers || defaultTeamMembers;
    }

    public set teamMembers(teamMembers: string[]) {
        this._teamMembers = teamMembers;
    }

    public get roles(): string[] {
        return this._roles || defaultRoles;
    }

    public set roles(roles: string[]) {
        this._roles = roles;
    }

    public get randomizerMode(): RandomizerModes {
        return this._randomizerMode || defaultRandomizerMode;
    }

    public set randomizerMode(randomizerMode: RandomizerModes) {
        this._randomizerMode = randomizerMode;
    }

    public get instantChoice(): boolean {
        return this._instantChoice || defaultInstantChoice;
    }

    public set instantChoice(instantChoice: boolean) {
        this._instantChoice = instantChoice;
    }

    public getState$(): Observable<string> {
        return this._state.pipe(map((state: DataStorageInterface) => JSON.stringify(state)));
    }

    public restoreState(serviceData: DataStorageInterface): void {
        this._teamMembers = serviceData.teamMembers;
        this._roles = serviceData.roles;
        this._rolesMap = serviceData.rolesMap;
        this._randomizerMode = serviceData.randomizerMode;
        this._instantChoice = serviceData.instantChoice;

        this.updateState();
    }

    public updateState(): void {
        this._state.next({
            teamMembers: this.teamMembers,
            roles: this.roles,
            rolesMap: this.rolesMap,
            randomizerMode: this.randomizerMode,
            instantChoice: this.instantChoice,
        });
    }
}
