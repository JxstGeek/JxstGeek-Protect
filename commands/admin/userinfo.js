export default {
    name: "userinfo",
    description: "Affiche des infos sur un membre. `+userinfo [@membre]`",
    async execute(message, args, client, config) {
        const member = message.mentions.members.first() || message.member;

        // Récupère tous les rôles (hors @everyone) et les ping (mention)
        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => `<@&${role.id}>`)
            .join(" ") || "Aucun rôle";

        const embed = {
            color: 0xe3b16c, // couleur en int, pas "#e3b16c"
            title: "Informations sur " + member.displayName,
            thumbnail: { url: member.user.displayAvatarURL() },
            fields: [
                { name: "ID", value: member.id, inline: true },
                { name: "Pseudo", value: member.user.username, inline: true },
                { name: "\u200B", value: "\u200B", inline: false },
                { name: "Créé le", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:f>`, inline: true },
                { name: "A rejoint le", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: true },
                { name: "\u200B", value: "\u200B", inline: false },
                { name: "Rôles", value: roles, inline: false }
            ]
        };

        await message.channel.send({ embeds: [embed] });
    }
};