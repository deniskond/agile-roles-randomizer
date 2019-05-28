import { RandomizerModes } from '../enums/randomizer-modes.enum';
import { RolesMapInterface } from './roles-map.interface';

export interface DataStorageInterface {
    teamMembers: string[];
    roles: string[];
    rolesMap: RolesMapInterface[];
    randomizerMode: RandomizerModes;
    instantChoice: boolean;
    slackToken: string;
    slackChannel: string;
}
