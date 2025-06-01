import fs from "fs";
import path from "path";

export default {
    name: "backup",
    description: "Sauvegarde la config du serveur (rôles, salons, permissions, etc.)",
    async execute(message, args, client, config) {
        // Permission check
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }

        const guild = message.guild;
        const backup = {
            name: guild.name,
            icon: guild.iconURL(),
            roles: guild.roles.cache
                .filter(r => r.id !== guild.id) // exclude @everyone
                .map(r => ({
                    id: r.id.toString(),
                    name: r.name,
                    color: r.color,
                    hoist: r.hoist,
                    position: r.position,
                    permissions: r.permissions.bitfield.toString(),
                    mentionable: r.mentionable
                })),
            channels: guild.channels.cache
                .sort((a, b) => a.rawPosition - b.rawPosition)
                .map(c => ({
                    id: c.id.toString(),
                    name: c.name,
                    type: c.type,
                    parent: c.parentId ? c.parentId.toString() : null,
                    position: Number(c.rawPosition),
                    rateLimitPerUser: c.rateLimitPerUser,
                    topic: c.topic,
                    nsfw: c.nsfw,
                    permissionOverwrites: c.permissionOverwrites.cache.map(po => ({
                        id: po.id.toString(),
                        type: po.type, // 'role' or 'member'
                        allow: po.allow.bitfield.toString(),
                        deny: po.deny.bitfield.toString()
                    }))
                }))
        };

        // Convert all BigInt in the structure (safety)
        const replacer = (key, value) =>
            typeof value === "bigint" ? value.toString() : value;

        const filePath = path.join(process.cwd(), `backup-${guild.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(backup, replacer, 2), "utf8");

        try {
            await message.author.send({ files: [filePath] });
            await message.reply("Backup envoyée en privé !");
        } catch (err) {
            await message.reply("Impossible d'envoyer la backup en privé. Vérifie que tes MP sont ouverts !");
        }
        fs.unlinkSync(filePath);
    }
};