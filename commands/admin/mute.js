export default {
    name: "mute",
    description: "Mute (timeout écrit/vocal) un membre pour un temps donné. `+mute @membre [temps: 10m, 2h, 1d, etc.] [raison]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const target = message.mentions.members.first();
        if (!target) return message.reply("Mentionne un membre à mute.");
        if (target.id === message.author.id) return message.reply("Tu ne peux pas te mute toi-même.");

        const timeArg = args[1] || "10m";
        const reason = args.slice(2).join(" ") || "Aucune raison fournie";

        // Convertit timeArg en ms (ex: 10m => 600000)
        const timeMap = { s: 1, m: 60, h: 3600, d: 86400 };
        const match = timeArg.match(/^(\d+)([smhd])$/);
        if (!match) return message.reply("Format du temps invalide. Exemples : 10m, 2h, 1d...");

        const duration = parseInt(match[1]) * timeMap[match[2]] * 1000;

        try {
            await target.timeout(duration, reason);
            await message.channel.send(`${target} est mute pour ${timeArg}. Raison : ${reason}`);
        } catch (e) {
            await message.reply("Impossible de mute ce membre.");
        }
    }
};