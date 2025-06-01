import fs from "fs";
import path from "path";
const WARN_FILE = path.join(process.cwd(), "warns.json");

export default {
    name: "warn",
    description: "Avertir un membre. `+warn @membre [raison]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply("Mentionne un membre à warn.");
        const reason = args.slice(1).join(" ") || "Aucune raison fournie";

        let warns = {};
        if (fs.existsSync(WARN_FILE)) {
            warns = JSON.parse(fs.readFileSync(WARN_FILE));
        }
        if (!warns[member.id]) warns[member.id] = [];
        warns[member.id].push({
            date: new Date().toLocaleString(),
            by: message.author.id,
            reason
        });
        fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 2));

        await message.channel.send(`${member} a reçu un avertissement. Raison : ${reason} (Total : ${warns[member.id].length})`);

        // Log dans le salon log par ID
        const logChannel = message.guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
            await logChannel.send(
                `⚠️ Warn infligé à ${member} par ${message.author}\n` +
                `**Raison**: ${reason}\n` +
                `**Date:** ${new Date().toLocaleString()}\n`
            );
        }
    }
};