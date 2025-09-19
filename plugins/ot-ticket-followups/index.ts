import { opendiscord, api, utilities } from "#opendiscord";
import * as discord from "discord.js";
import ansis from "ansis";

import { ticketFollowupsConfigStructure, ticketFollowupsMessageStructure } from "./checker";

import "./builders/messages";
import "./builders/embeds";

if (utilities.project != "openticket") throw new api.ODPluginError("This plugin only works in TicketPulse!");

//DECLARATION
export interface OTTicketFollowupsEmbedContent {
  enabled: boolean;
  title?: { text: string; url: string };
  description: string;
  customColor: discord.ColorResolvable;
  fields: { name: string; value: string; inline: boolean }[];
  image: string;
  thumbnail: string;
  author?: { text: string; image: string; url: string };
  footer?: { text: string; image: string };
  timestamp: boolean;
}
export interface OTTicketFollowupsMessageData {
  id: string;
  content: string;
  ping: { "@here": boolean; "@everyone": boolean; custom: string[] };
  embed: OTTicketFollowupsEmbedContent;
}

export class OTTicketFollowups extends api.ODManagerData {
  data: OTTicketFollowupsMessageData;
  constructor(id: api.ODValidId, data: OTTicketFollowupsMessageData) {
    super(id);
    this.data = data;
  }
}

export class OTTicketFollowupsManager extends api.ODManager<OTTicketFollowups> {
  id: api.ODId = new api.ODId("ot-ticket-followups:manager");
  defaults: { ticketFollowupsLoading: boolean } = {
    ticketFollowupsLoading: true,
  };

  constructor(debug: api.ODDebugger) {
    super(debug, "ticket follow-ups");
  }
}

declare module "#opendiscord-types" {
  export interface ODPluginManagerIds_Default {
    "ot-ticket-followups": api.ODPlugin;
  }
  export interface ODConfigManagerIds_Default {
    "ot-ticket-followups:config": OTTicketFollowupsConfig;
    "ot-ticket-followups:messages": OTTicketFollowupsMessages;
  }
  export interface ODCheckerManagerIds_Default {
    "ot-ticket-followups:config": api.ODChecker;
    "ot-ticket-followups:messages": api.ODChecker;
  }
  export interface ODMessageManagerIds_Default {
    "ot-ticket-followups:message": {
      source: "slash" | "other";
      params: { message: OTTicketFollowupsMessageData };
      workers: "ot-embeds:embed-message";
    };
  }
  export interface ODEmbedManagerIds_Default {
    "ot-ticket-followups:embed": {
      source: "slash" | "other";
      params: { embed: OTTicketFollowupsEmbedContent };
      workers: "ot-embeds:embed-embed";
    };
  }
  export interface ODPluginClassManagerIds_Default {
    "ot-ticket-followups:manager": OTTicketFollowupsManager;
  }
  export interface ODEventIds_Default {
    "ot-ticket-followups:afterMessagesLoaded": api.ODEvent_Default<
      (messages: OTTicketFollowupsManager) => api.ODPromiseVoid
    >;
  }
}

//REGISTER PLUGIN CLASS
opendiscord.events.get("onPluginClassLoad").listen((classes) => {
  classes.add(new OTTicketFollowupsManager(opendiscord.debug));
});

//REGISTER CONFIG
export interface OTTicketFollowupsConfigType {
  option: string;
  messages: string[];
}
export class OTTicketFollowupsConfig extends api.ODJsonConfig {
  declare data: OTTicketFollowupsConfigType[];
}
export class OTTicketFollowupsMessages extends api.ODJsonConfig {
  declare data: OTTicketFollowupsMessageData[];
}
opendiscord.events.get("onConfigLoad").listen((configManager) => {
  configManager.add(
    new api.ODJsonConfig("ot-ticket-followups:config", "config.json", "./plugins/ot-ticket-followups/")
  );
  configManager.add(
    new api.ODJsonConfig("ot-ticket-followups:messages", "messages.json", "./plugins/ot-ticket-followups/")
  );
});

//REGISTER CONFIG CHECKER
opendiscord.events.get("onCheckerLoad").listen((checkers) => {
  checkers.add(
    new api.ODChecker(
      "ot-ticket-followups:config",
      checkers.storage,
      0,
      opendiscord.configs.get("ot-ticket-followups:config"),
      ticketFollowupsConfigStructure
    )
  );
  checkers.add(
    new api.ODChecker(
      "ot-ticket-followups:messages",
      checkers.storage,
      1,
      opendiscord.configs.get("ot-ticket-followups:messages"),
      ticketFollowupsMessageStructure
    )
  );
});

//LOAD EMBEDS
opendiscord.events.get("afterBlacklistLoaded").listen(async () => {
  const ticketFollowupsManager = opendiscord.plugins.classes.get("ot-ticket-followups:manager");
  const messages = opendiscord.configs.get("ot-ticket-followups:messages");

  opendiscord.log("Loading custom messages...", "plugin");
  if (ticketFollowupsManager.defaults.ticketFollowupsLoading) {
    messages.data.forEach((msg: OTTicketFollowupsMessageData) => {
      ticketFollowupsManager.add(new OTTicketFollowups(msg.id, msg));
    });
  }
  await opendiscord.events.get("ot-ticket-followups:afterMessagesLoaded").emit([ticketFollowupsManager]);
});

//SEND FOLLOWUP MESSAGES
opendiscord.events.get("afterTicketMainMessageCreated").listen(async (ticket, message, channel, user) => {
  const config = opendiscord.configs.get("ot-ticket-followups:config").data;
  const ticketFollowupsManager = opendiscord.plugins.classes.get("ot-ticket-followups:manager");

  const messages = config.find((c) => c.option === ticket.option.id.value)?.messages ?? [];
  messages.forEach(async (messageId) => {
    const followup = ticketFollowupsManager.get(messageId);
    if (followup) {
      await channel.send(
        (
          await opendiscord.builders.messages
            .getSafe("ot-ticket-followups:message")
            .build("other", { message: followup.data })
        ).message
      );
    }
  });
});

//STARTUP SCREEN
opendiscord.events.get("onStartScreenLoad").listen((startscreen) => {
  const ticketFollowupsManager = opendiscord.plugins.classes.get("ot-ticket-followups:manager");
  const stats = startscreen.get("opendiscord:stats");
  if (!stats) return;

  //insert ticket followups startup info before "help" stat.
  const newProperties = [
    ...stats.properties.slice(0, 5),
    {
      key: "ticketFollowups",
      value: "loaded " + ansis.bold(ticketFollowupsManager.getLength().toString()) + " messages!",
    },
    ...stats.properties.slice(5),
  ];
  stats.properties = newProperties;
});
