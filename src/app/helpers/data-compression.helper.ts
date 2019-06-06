import { DataStorageInterface } from '../interfaces/data-storage.interface';
import { RolesMapInterface } from '../interfaces/roles-map.interface';
import { MinimizedDataStorageInterface } from '../interfaces/minimized-data-storage.interface';

const NUMBER_SYSTEM_BASE = 36;

export function compressSettings({
    teamMembers,
    roles,
    rolesMap,
    randomizerMode,
    instantChoice,
    slackToken,
    slackChannel,
}: DataStorageInterface): MinimizedDataStorageInterface {
    const compressedRolesMap = teamMembers
        .map((person: string) => {
            const { teamMemberRoles } = rolesMap.find(({ teamMember }: RolesMapInterface) => teamMember === person);

            return roles.map((role: string) => +teamMemberRoles.includes(role)).join('');
        })
        .map((stringifiedMemberRoles: string) => parseInt(`1${stringifiedMemberRoles}`, 2))
        .map((integerRepresentation: number) => integerRepresentation.toString(NUMBER_SYSTEM_BASE))
        .join('|');

    return {
        t: teamMembers,
        r: roles,
        z: compressedRolesMap,
        m: randomizerMode,
        i: +instantChoice,
        s: slackToken,
        c: slackChannel,
    };
}

export function decompressSettings({ t, r, z, m, i, s, c }: MinimizedDataStorageInterface): DataStorageInterface {
    const teamMembers = t;
    const roles = r;

    const stringRepresentation = z
        .split('|')
        .map((stringifiedMemberRoles: string) => parseInt(stringifiedMemberRoles, NUMBER_SYSTEM_BASE))
        .map((integerRepresentation: number) => integerRepresentation.toString(2).substr(1))
        .join('');

    const rolesMap = teamMembers.map((teamMember: string, teamMemberIndex: number) => ({
        teamMember,
        teamMemberRoles: roles.filter((_, roleIndex: number) => !!+stringRepresentation[teamMemberIndex * roles.length + roleIndex]),
    }));

    return {
        teamMembers,
        roles,
        rolesMap,
        randomizerMode: m,
        instantChoice: !!i,
        slackToken: s,
        slackChannel: c,
    };
}
