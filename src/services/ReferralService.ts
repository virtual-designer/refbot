import Service from "../core/Service";
import crypto from 'crypto';
import { Snowflake } from "discord.js";
import { RefCode } from "@prisma/client";

class ReferralService extends Service {
    public readonly name = "referral";

    public generateRandomCode(length: number = 16) {
        const code = crypto.randomBytes(length).toString('base64');
        return code.replace(/=/g, '_');
    }

    async createCode(createdBy: Snowflake, code?: string): Promise<RefCode | null> {
        if (code) {
            const ref = await this.client.prisma.refCode.findFirst({
                where: {
                    code
                }
            });

            if (ref) {
                return null;
            }
        }

        return this.client.prisma.refCode.create({
            data: {
                code: code ?? this.generateRandomCode(),
                createdBy
            }
        });
    }

    public addUser(refId: number, userId: Snowflake) {
        return this.client.prisma.discordUser.create({
            data: {
                id: userId,
                refCodesUsed: {
                    connect: {
                        id: refId
                    }
                }
            }
        });
    }

    public findRef(code: string, userId?: Snowflake) {
        return this.client.prisma.refCode.findFirst({
            where: {
                code,
                createdBy: userId
            },
            include: {
                usedBy: true
            }
        });
    }
}

export default ReferralService;