import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import logTicket from "../logs/ticketLogger.js";

export default {
  name: "ticket-close",
  description: "Ferme le ticket (commande ou bouton).",
  async execute(message, args, client, config) {
    if (!message.channel.name.startsWith("ticket-")) {
      await message.reply("Cette commande doit être utilisée dans un salon de ticket.");
      return;
    }
    // Ajoute un bouton de confirmation
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Fermer le ticket")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("ticket_transcript")
        .setLabel("Transcript (logs)")
        .setStyle(ButtonStyle.Secondary)
    );
    await message.channel.send({ content: "Actions disponibles pour ce ticket :", components: [row] });
  }
};