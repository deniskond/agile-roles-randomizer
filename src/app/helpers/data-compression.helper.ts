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
        .join('');

    const integerRepresentation = parseInt(`1${compressedRolesMap}`, 2);
    const stringifiedMap = integerRepresentation.toString(NUMBER_SYSTEM_BASE);

    return {
        t: teamMembers,
        r: roles,
        z: stringifiedMap,
        m: randomizerMode,
        i: +instantChoice,
        s: slackToken,
        c: slackChannel,
    };
}

export function decompressSettings({ t, r, z, m, i, s, c }: MinimizedDataStorageInterface): DataStorageInterface {
    const teamMembers = t;
    const roles = r;
    const destringifedMap = parseInt(z, NUMBER_SYSTEM_BASE);
    const stringRepresentation = destringifedMap.toString(2).substr(1);

    const rolesMap = teamMembers.map((teamMember: string, teamMemberIndex: number) => ({
        teamMember,
        teamMemberRoles: roles.filter((_, roleIndex: number) => !!stringRepresentation[teamMemberIndex * roles.length + roleIndex]),
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
