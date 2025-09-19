import { opendiscord, api, utilities } from "#opendiscord";

//REGISTER EMBED BUILDER
opendiscord.events.get("onEmbedBuilderLoad").listen((embeds) => {
  embeds.add(new api.ODEmbed("ot-ticket-followups:embed"));
  embeds.get("ot-ticket-followups:embed").workers.add(
    new api.ODWorker("ot-ticket-followups:embed", 0, (instance, params, source, cancel) => {
      const generalConfig = opendiscord.configs.get("opendiscord:general");
      const { embed } = params as any;

      if (embed.title) {
        instance.setTitle(embed.title.text);
        if (embed.title.url) instance.setUrl(embed.title.url);
      }
      instance.setColor(embed.customColor ? embed.customColor : generalConfig.data.mainColor);
      if (embed.description) instance.setDescription(embed.description);

      if (embed.image) instance.setImage(embed.image);
      if (embed.thumbnail) instance.setThumbnail(embed.thumbnail);
      if (embed.footer.text) instance.setFooter(embed.footer.text, embed.footer.image ? embed.footer.image : null);
      if (embed.author.text)
        instance.setAuthor(
          embed.author.text,
          embed.author.image ? embed.author.image : null,
          embed.author.url ? embed.author.url : null
        );

      if (embed.timestamp) instance.setTimestamp(new Date());
      if (Array.isArray(embed.fields) && embed.fields.length > 0) instance.setFields(embed.fields);
    })
  );
});
