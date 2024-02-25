import { GuildMember, PermissionsString } from "discord.js";
import Client from "../core/Client";
import type ConfigService from "../services/ConfigService";

export function isDevelopmentMode() {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
}

export function isModerator(client: Client, member: GuildMember) {
    if (member.id === member.guild.ownerId) {
        return true;
    }

    const config = client.getService<ConfigService>('config').config(member.guild.id);

    if (!config) {
        return false;
    }

    if (config.moderator_permissions.users.includes(member.id)) {
        return true;
    }

    for (const roleId of config.moderator_permissions.roles) {
        if (member.roles.cache.has(roleId)) {
            return true;
        }
    }

    for (const permissionSet of config.moderator_permissions.permission_sets) {
        if (member.permissions.has(permissionSet as PermissionsString[], true)) {
            return true;
        }
    }

    return false;
}