import {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import logTicket from "../logs/ticketLogger.js";
import config from "../../config.js";

const categories = {
  ticket: config.ticketsStaffCategory,
  report: config.ticketsReportCategory,
  contestation: config.ticketsContestationCategory,
};

export default async (client, interaction) => {
  // CRÉATION DU TICKET
  if (interaction.isStringSelectMenu() && interaction.customId === "create_ticket_select") {
    await interaction.deferReply({ flags: 64 });

    const type = interaction.values[0];
    const catId = categories[type];
    if (!catId) {
      return interaction.editReply({ content: "Erreur : catégorie inconnue pour ce type de ticket. Veuillez contacter un staff." });
    }

    const ticketName = `${type}-${interaction.user.username}`;
    // Vérifie si déjà un ticket de ce type ouvert
    const existing = interaction.guild.channels.cache.find(
      c => c.name === ticketName
    );
    if (existing) {
      await interaction.editReply({ content: "Tu as déjà un ticket ouvert dans cette catégorie !" });
      return;
    }

    // Crée le salon ticket
    const ticketChannel = await interaction.guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: catId,
      topic: `${interaction.user.id} - ${type} - ${interaction.user.username}`,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        // Accès aux rôles staff
        ...config.ticketsSupportRoleIds.map(id => ({
          id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
        })),
      ]
    });

    // Embed d'informations du ticket
    const infoEmbed = new EmbedBuilder()
      .setTitle("Informations du Ticket")
      .setDescription(
        `Ce ticket a été ouvert par <@${interaction.user.id}>.\nMerci d'expliquer clairement ton problème ou ta demande.\nUn membre du staff va bientôt te répondre.`
      )
      .addFields(
        { name: "Ouvert par", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Type", value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
        { name: "ID utilisateur", value: interaction.user.id, inline: false }
      )
      .setColor(config.embedColor)
      .setTimestamp();

    // Row avec boutons
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Fermer le ticket")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("ticket_transcript")
        .setLabel("Transcript")
        .setStyle(ButtonStyle.Secondary)
    );

    // Envoie l'embed d'information
    await ticketChannel.send({
      content: `<@${interaction.user.id}> Bienvenue dans ton ticket !`,
      embeds: [infoEmbed],
      components: [buttonRow]
    });

    await interaction.editReply({ content: `Ton ticket **${type}** a été créé : <#${ticketChannel.id}>` });

    // ===== Ajout du refresh du menu après 1 minute =====
    setTimeout(async () => {
      // Reconstruis le menu vierge (aucune option sélectionnée par défaut)
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
        await interaction.message.edit({ components: [refreshedRow] });
      } catch (e) {
        // message supprimé ou déjà édité
      }
    }, 30000);
    // ===== fin refresh menu =====

    return;
  }

  // HANDLING DES BOUTONS TICKET
  if (interaction.isButton()) {
    // Bouton "fermer le ticket" - demande confirmation
    if (interaction.customId === "ticket_close") {
      return interaction.reply({
        content: "Es-tu sûr de vouloir fermer ce ticket ?",
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("ticket_close_confirm")
              .setLabel("Oui, supprimer")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId("ticket_close_cancel")
              .setLabel("Annuler")
              .setStyle(ButtonStyle.Secondary)
          )
        ],
        
      });
    }

    // Confirmation suppression
    if (interaction.customId === "ticket_close_confirm") {
      await interaction.reply({ content: "Fermeture du ticket...", flags: 64 });
      await logTicket(interaction.channel, interaction.user, client);
      await interaction.channel.delete("Ticket fermé");
      return;
    }

    // Annulation suppression
    if (interaction.customId === "ticket_close_cancel") {
      await interaction.update({ content: "Fermeture annulée.", components: [],  });
      return;
    }

    // Bouton transcript : envoie le transcript en MP à l'utilisateur ayant ouvert le ticket
    if (interaction.customId === "ticket_transcript") {
      await logTicket(interaction.channel, interaction.user, client, { onlyDM: true });
      await interaction.reply({ content: "Le transcript t'a été envoyé en message privé.", flags: 64 });
      return;
    }

    // Support pour l'ancien bouton (sécurité)
    if (interaction.customId === "confirm_close") {
      await interaction.reply({ content: "Fermeture du ticket...",  });
      await logTicket(interaction.channel, interaction.user, client);
      await interaction.channel.delete("Ticket fermé");
    }
  }
};