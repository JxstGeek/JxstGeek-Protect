import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
} from "discord.js";
import config from "../../config.js";

export default {
  name: "ticket-panel",
  async execute(message, args, client, config) {
    if (!message.guild || !message.channel) return;

    const embed = new EmbedBuilder()
      .setTitle("Tickets 🎫")
      .setDescription("Pour ouvrir un ticket, sélectionnez le sujet de celui-ci dans le menu déroulant ci-dessous")
      .setImage("https://zupimages.net/up/25/20/re94.png")
      .setColor(config.embedColor);

    // Construction du menu déroulant
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("create_ticket_select")
      .setPlaceholder("Choisissez le type de ticket")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Ticket Staff")
          .setValue("ticket")
          .setDescription("Problème ou question sur le serveur")
          .setEmoji("⚡"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Signalement")
          .setValue("report")
          .setDescription("Signaler un joueur ou un bug")
          .setEmoji("🚨"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Contestation")
          .setValue("contestation")
          .setDescription("Contester un bannissement ou une sanction")
          .setEmoji("⛔")
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Envoi du panel + menu déroulant
    const sentMsg = await message.channel.send({
      embeds: [embed],
      components: [row],
    });

    // Après 1 minute, édite le message pour remettre le menu à zéro (aucune sélection)
    setTimeout(async () => {
      // On recrée le menu (aucune option selected par défaut de toute façon)
      const refreshedMenu = new StringSelectMenuBuilder()
        .setCustomId("create_ticket_select")
        .setPlaceholder("Choisissez le type de ticket")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Ticket Staff")
            .setValue("ticket")
            .setDescription("Problème ou question sur le serveur")
            .setEmoji("⚡"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Signalement")
            .setValue("report")
            .setDescription("Signaler un joueur ou un bug")
            .setEmoji("🚨"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Contestation")
            .setValue("contestation")
            .setDescription("Contester un bannissement ou une sanction")
            .setEmoji("⛔")
        );
      const refreshedRow = new ActionRowBuilder().addComponents(refreshedMenu);

      try {
        await sentMsg.edit({
          components: [refreshedRow]
        });
      } catch (err) {
        // Si le message a été supprimé, on ignore
      }
    }, 60000); // 60 000ms = 1 minute
  }
};