import { opendiscord, api, utilities } from "#opendiscord";
import * as discord from "discord.js";

//REGISTER MESSAGE BUILDER
opendiscord.events.get("onMessageBuilderLoad").listen((messages) => {
  messages.add(new api.ODMessage("ot-ticket-followups:message"));
  messages.get("ot-ticket-followups:message").workers.add(
    new api.ODWorker("ot-ticket-followups:message", 0, async (instance, params, source, cancel) => {
      const { message } = params;

      if (message.embed?.enabled) {
        instance.addEmbed(
          await opendiscord.builders.embeds.getSafe("ot-ticket-followups:embed").build(source, { embed: message.embed })
        );
      }

      const pings: string[] = [];
      if (message.ping["@everyone"]) pings.push("@everyone");
      if (message.ping["@here"]) pings.push("@here");
      message.ping.custom.forEach((ping) => pings.push(discord.roleMention(ping)));
      const pingText = pings.length > 0 ? pings.join(" ") + "\n" : "";

      if (message.content !== "") instance.setContent(pingText + message.content);
      else if (pings.length > 0) instance.setContent(pingText);
    })
  );
});
