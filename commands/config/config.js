import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  PermissionsBitField,
} from "discord.js";
import fs from "fs";
import config from "../../config.js";

// ========================
// 1. Constantes & Mappings
// ========================

const UNEDITABLE_FIELDS = [
  "token", "antispam", "antilink", "backupPath"
];
const UNDISPLAYED_FIELDS = [
  "token", "backupPath"
];

const FIELD_LABELS = {
  prefix: "Préfixe du bot",
  embedColor: "Couleur des embeds",
  ticketsLogChannelId: "Salon logs tickets",
  ticketsStaffCategory: "Catégorie Tickets Staff",
  ticketsReportCategory: "Catégorie Tickets Signalement",
  ticketsContestationCategory: "Catégorie Tickets Contestation",
  ticketsSupportRoleIds: "Rôles support tickets",
  adminRoles: "Rôles administrateurs",
  logsChannelId: "Salon de logs général",
  welcomeChannelId: "Salon de bienvenue",
  leaveChannelId: "Salon des départs",
  modmailCategory: "Catégorie Modmail",
  antispam: "AntiSpam (non modifiable)",
  antilink: "AntiLien (non modifiable)"
};

const FIELD_ORDER = [
  "prefix", "embedColor", "adminRoles",
  "ticketsLogChannelId", "ticketsStaffCategory", "ticketsReportCategory", "ticketsContestationCategory", "ticketsSupportRoleIds",
  "logsChannelId", "welcomeChannelId", "leaveChannelId", "modmailCategory",
  "antispam", "antilink"
];

const FIELD_EMOJIS = {
  prefix: "🔤",
  embedColor: "🎨",
  adminRoles: "🛡️",
  ticketsLogChannelId: "📝",
  ticketsStaffCategory: "📁",
  ticketsReportCategory: "🚨",
  ticketsContestationCategory: "⚖️",
  ticketsSupportRoleIds: "🙋",
  logsChannelId: "📋",
  welcomeChannelId: "👋",
  leaveChannelId: "🏃",
  modmailCategory: "📬",
  antispam: "🚫",
  antilink: "🔗"
};

// ================
// 2. Utilitaires
// ================

function tagCategory(guild, categoryId) {
  const category = guild.channels.cache.get(categoryId);
  if (
    category &&
    (category.type === 4 ||
      category.type === "GUILD_CATEGORY" ||
      category.type === "category")
  ) {
    return `\`${category.name}\``;
  }
  return `\`${categoryId}\``;
}

function tagChannel(client, channelId) {
  const channel = client.channels.cache.get(channelId);
  return channel ? `<#${channel.id}>` : `\`${channelId}\``;
}

function tagRole(guild, roleId) {
  const role = guild.roles.cache.get(roleId);
  return role ? `<@&${role.id}>` : `\`${roleId}\``;
}

function tagRoles(guild, ids) {
  if (!Array.isArray(ids)) return tagRole(guild, ids);
  return ids.map(id => tagRole(guild, id)).join(", ");
}

function isConfigured(val) {
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object" && val !== null) return Object.keys(val).length > 0;
  return val !== undefined && val !== null && val !== "";
}

function displayColorField(value) {
  if (!value) return "`Non configuré`";
  if (typeof value === "string" && (value.startsWith("#") || value.startsWith("0x"))) return `\`${value}\``;
  if (typeof value === "string" && /^\d+$/.test(value)) value = Number(value);
  if (typeof value === "number") return `\`#${value.toString(16).padStart(6, "0")}\` (\`${value}\`)`;
  return `\`${value}\``;
}

function tryParse(val) {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

function saveConfig(newConfig) {
  const content = "export default " + JSON.stringify(newConfig, null, 4) + ";";
  fs.writeFileSync("./config.js", content, "utf-8");
}

// =====================
// 3. Génération d'affichage
// =====================

function getConfigFields(message, client) {
  const guild = message.guild;
  return FIELD_ORDER
    .filter(key => config[key] !== undefined && !UNDISPLAYED_FIELDS.includes(key))
    .map(key => {
      let displayValue;
      if (key === "embedColor") {
        displayValue = displayColorField(config[key]);
      } else if (key.endsWith("Category")) {
        displayValue = isConfigured(config[key])
          ? tagCategory(guild, config[key])
          : "`Non configuré`";
      } else if (key.endsWith("ChannelId")) {
        displayValue = isConfigured(config[key])
          ? tagChannel(client, config[key])
          : "`Non configuré`";
      } else if (key.endsWith("RoleIds") || key === "adminRoles") {
        displayValue = isConfigured(config[key])
          ? tagRoles(guild, config[key])
          : "`Non configuré`";
      } else {
        displayValue = isConfigured(config[key])
          ? `\`${Array.isArray(config[key]) ? config[key].join(", ") : config[key]}\``
          : "`Non configuré`";
      }
      return {
        name: `${FIELD_EMOJIS[key] || ""} ${FIELD_LABELS[key] || key}`,
        value: `> ${displayValue} ${isConfigured(config[key]) ? "✅" : "❌"}`,
        inline: false,
      };
    });
}

function getConfigMenu() {
  return new StringSelectMenuBuilder()
    .setCustomId("config_select")
    .setPlaceholder("Choisis un champ à modifier")
    .addOptions(
      FIELD_ORDER.filter(key =>
        config[key] !== undefined &&
        !UNEDITABLE_FIELDS.includes(key) &&
        !UNDISPLAYED_FIELDS.includes(key)
      ).map(key =>
        new StringSelectMenuOptionBuilder()
          .setLabel(FIELD_LABELS[key] || key)
          .setValue(key)
          .setDescription(isConfigured(config[key]) ? "Modifier" : "Configurer")
          .setEmoji(FIELD_EMOJIS[key] || "⚙️")
      )
    );
}

// ==============
// 4. Commande principale
// ==============

export default {
  name: "config",
  description: "Affiche ou modifie la configuration du bot.",
  async execute(message, args, client, config) {
    if (
      !message.member.roles.cache.hasAny(...config.adminRoles)
      && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("Tu n'as pas la permission d'utiliser cette commande.");
    }

    // -- Affichage embed principal + menu
    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuration du bot")
      .setDescription(
        "Voici la configuration actuelle du bot.\n\n" +
        "• **✅** : Champ configuré\n" +
        "• **❌** : Champ non configuré\n\n" +
        "Sélectionne un champ à modifier dans le menu ci-dessous."
      )
      .addFields(getConfigFields(message, message.client))
      .setColor(config.embedColor || 0x3498db);

    const row = new ActionRowBuilder().addComponents(getConfigMenu());

    const sentMsg = await message.channel.send({
      embeds: [embed],
      components: [row],
    });

    // -- Collector menu
    const collector = sentMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id && i.customId === "config_select",
      time: 120000,
      max: 1,
    });

    collector.on("collect", async (selectInt) => {
      const selectedKey = selectInt.values[0];

      // -- Si channel, menu déroulant salons textuels
      if (selectedKey.endsWith("ChannelId")) {
        const channelOptions = message.guild.channels.cache
          .filter(c => c.isTextBased() && c.type === 0)
          .map(c => ({
            label: `#${c.name}`,
            value: c.id,
            description: `Salon #${c.name}`
          }))
          .slice(0, 25);

        const channelMenu = new StringSelectMenuBuilder()
          .setCustomId(`config_select_channel_${selectedKey}`)
          .setPlaceholder("Sélectionne un salon")
          .addOptions(channelOptions);

        const channelRow = new ActionRowBuilder().addComponents(channelMenu);

        await selectInt.followUp({
          content: `Sélectionne le salon pour **${FIELD_LABELS[selectedKey] || selectedKey}**`,
          components: [channelRow],
          ephemeral: true
        });

        // -- Sélection du salon
        const filter = i => i.user.id === message.author.id && i.customId === `config_select_channel_${selectedKey}`;
        message.channel.awaitMessageComponent({ filter, time: 60000, componentType: 3 })
          .then(async (chanInt) => {
            const channelId = chanInt.values[0];
            const oldVal = config[selectedKey];
            config[selectedKey] = channelId;
            saveConfig(config);

            await updateConfigEmbed(sentMsg, message, selectedKey, oldVal, channelId);

            await chanInt.reply({ content: "Configuration mise à jour avec succès !", ephemeral: true });
          })
          .catch(() => {
            selectInt.followUp({ content: "Aucune sélection reçue, modification annulée.", ephemeral: true });
          });
        return;
      }

      // -- Sinon, demande la valeur
      await selectInt.reply({
        content: `Envoie la **nouvelle valeur** pour **${FIELD_LABELS[selectedKey] || selectedKey}** :\n\n` +
        "_Pour les listes (IDs, rôles...), mets une liste séparée par des virgules ou du JSON._",
        ephemeral: true,
      });

      const mCollector = message.channel.createMessageCollector({
        filter: (m) => m.author.id === message.author.id,
        max: 1,
        time: 60000,
      });

      mCollector.on("collect", (m) => {
        let oldVal = config[selectedKey];
        let newVal = tryParse(m.content);

        config[selectedKey] = newVal;
        saveConfig(config);

        updateConfigEmbed(sentMsg, message, selectedKey, oldVal, newVal);
        m.reply("Configuration mise à jour avec succès !");
      });

      mCollector.on("end", (collected) => {
        if (!collected.size) {
          selectInt.followUp({ content: "Modification annulée (pas de valeur reçue).", ephemeral: true });
        }
      });
    });

    collector.on("end", (collected) => {
      if (!collected.size) {
        sentMsg.edit({ components: [] });
      }
    });
  },
};

// ========
// 5. Helpers
// ========

// Rafraîchit l’embed après modification
async function updateConfigEmbed(sentMsg, message, key, oldVal, newVal) {
  const embed = new EmbedBuilder()
    .setTitle("⚙️ Configuration du bot (mise à jour)")
    .setDescription(
      `Champ **${FIELD_LABELS[key] || key}** modifié avec succès.\n\n` +
      `**Ancienne valeur :** \`${JSON.stringify(oldVal)}\`\n**Nouvelle valeur :** \`${JSON.stringify(newVal)}\``
    )
    .addFields(getConfigFields(message, message.client))
    .setColor(config.embedColor || 0x3498db);

  await sentMsg.edit({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(getConfigMenu())]
  });
}