import fs from "fs";
import path from "path";

const WARN_FILE = path.join(process.cwd(), "warns.json");

export default {
    name: "warns",
    description: "Affiche les warns d’un membre. `+warns @membre`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Mentionne le membre dont tu veux voir les warns.");

        let warns = {};
        if (fs.existsSync(WARN_FILE)) {
            warns = JSON.parse(fs.readFileSync(WARN_FILE));
        }

        const userWarns = warns[member.id] || [];

        if (userWarns.length === 0) {
            return message.reply(`${member} n'a aucun avertissement.`);
        }

        let warnList = userWarns
            .map((warn, i) => `#${i + 1} - **${warn.reason}** (par <@${warn.by}>, le ${warn.date})`)
            .join("\n");

        await message.channel.send({
            embeds: [{
                color: 0xE67E22,
                title: `Warns de ${member.user.username}`,
                description: warnList
            }]
        });
    }
};