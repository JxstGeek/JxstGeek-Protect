import fs from "fs";
import path from "path";

const WARN_FILE = path.join(process.cwd(), "warns.json");

export default {
    name: "removewarn",
    description: "Supprime un warn d’un membre. `+removewarn @membre [index]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }

        const member = message.mentions.members.first();
        const index = parseInt(args[1]) - 1;

        if (!member) return message.reply("Mentionne le membre dont tu veux retirer un warn.");
        if (isNaN(index)) return message.reply("Précise le numéro du warn à supprimer (ex: +removewarn @user 1)");

        let warns = {};
        if (fs.existsSync(WARN_FILE)) {
            warns = JSON.parse(fs.readFileSync(WARN_FILE));
        }

        if (!warns[member.id] || !warns[member.id][index]) {
            return message.reply("Aucun warn à ce numéro pour ce membre.");
        }

        const removedWarn = warns[member.id].splice(index, 1)[0];
        fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 2));

        await message.channel.send(`Warn #${index + 1} retiré à ${member}.`);

        // Log dans le salon log par ID
        const logChannel = message.guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
            await logChannel.send(
                `🗑️ Warn retiré à ${member} par ${message.author}\n` +
                `**Raison du warn retiré**: ${removedWarn.reason}\n` +
                `**Date:** ${removedWarn.date}\n`
            );
        }
    }
};