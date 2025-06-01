export default {
    name: "serverinfo",
    description: "Affiche les infos du serveur",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const guild = message.guild;
        const embed = {
            color: 0x7289DA,
            title: `Informations du serveur`,
            thumbnail: { url: guild.iconURL() },
            fields: [
                { name: "Nom", value: guild.name, inline: true },
                { name: "ID", value: guild.id, inline: true },
                { name: "Membres", value: `${guild.memberCount}`, inline: true },
                { name: "Salons", value: `${guild.channels.cache.size}`, inline: true },
                { name: "Rôles", value: `${guild.roles.cache.size}`, inline: true },
                { name: "Créé le", value: `<t:${Math.floor(guild.createdTimestamp/1000)}:F>`, inline: false },
                { name: "Propriétaire", value: `<@${guild.ownerId}>`, inline: true }
            ]
        };
        await message.channel.send({ embeds: [embed] });
    }
};