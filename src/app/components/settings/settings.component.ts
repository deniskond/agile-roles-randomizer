import { RandomizerModes } from '../../enums/randomizer-modes.enum';
import { DataStorageService } from '../../services/data-storage/data-storage.service';
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
    public roles = this.dataStorageService.roles;
    public teamMembers = this.dataStorageService.teamMembers;
    public randomizerMode = this.dataStorageService.randomizerMode;
    public instantChoice = this.dataStorageService.instantChoice;
    public slackToken = this.dataStorageService.slackToken;
    public slackChannel = this.dataStorageService.slackChannel;
    public randomizerModes = RandomizerModes;
    public copyLink: string;

    private onDestroy$ = new Subject<void>();

    constructor(private dataStorageService: DataStorageService, private snackBar: MatSnackBar, private cd: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.dataStorageService
            .getState$()
            .pipe(
                filter(state => !!state),
                map((state: string) => `${window.location.href.replace('settings', '')}?data=${state}`),
                takeUntil(this.onDestroy$),
            )
            .subscribe((link: string) => {
                this.copyLink = link;
                this.cd.detectChanges();
            });

        this.dataStorageService.updateState();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    public trackByFn = number => number;

    public addFormControlForRole(): void {
        this.roles = [...this.roles, ''];
    }

    public onRoleValueChange(event: Event, index: number): void {
        const newValue = (event.target as HTMLInputElement).value;

        this.roles = [...this.roles.slice(0, index), newValue, ...this.roles.slice(index + 1, this.roles.length)];
    }

    public removeRole(roleIndex: number): void {
        this.roles = [...this.roles.slice(0, roleIndex), ...this.roles.slice(roleIndex + 1, this.roles.length)];
    }

    public addFormControlForTeamMember(): void {
        this.teamMembers = [...this.teamMembers, ''];
    }

    public onTeamMemberValueChange(event: Event, index: number): void {
        const newValue = (event.target as HTMLInputElement).value;

        this.teamMembers = [...this.teamMembers.slice(0, index), newValue, ...this.teamMembers.slice(index + 1, this.teamMembers.length)];
    }

    public removeTeamMember(teamMemberIndex: number): void {
        this.teamMembers = [
            ...this.teamMembers.slice(0, teamMemberIndex),
            ...this.teamMembers.slice(teamMemberIndex + 1, this.teamMembers.length),
        ];
    }

    public saveStateToService(): void {
        this.dataStorageService.randomizerMode = this.randomizerMode;
        this.dataStorageService.instantChoice = this.instantChoice;
        this.dataStorageService.updateState();
    }

    public copyLinkToClipboard(): void {
        this.snackBar.open('Ссылка скопирована в буфер обмена', '', { duration: 1000 });
    }

    public onSlackTokenValueChange(event: Event): void {
        this.dataStorageService.slackToken = (event.target as HTMLInputElement).value;
    }

    public onSlackChannelValueChange(event: Event): void {
        this.dataStorageService.slackChannel = (event.target as HTMLInputElement).value;
    }
}
