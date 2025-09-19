import { opendiscord, api, utilities } from "#opendiscord";

export const ticketFollowupsConfigStructure = new api.ODCheckerArrayStructure("ot-ticket-followups:config", {
  allowedTypes: ["object"],
  propertyChecker: new api.ODCheckerObjectStructure("ot-ticket-followups:config", {
    children: [
      {
        key: "option",
        optional: false,
        priority: 0,
        checker: new api.ODCheckerCustomStructure_UniqueId(
          "ot-ticket-followups:option",
          "openticket",
          "ot-ticket-followups:option-ids"
        ),
      },
      {
        key: "messages",
        optional: false,
        priority: 0,
        checker: new api.ODCheckerCustomStructure_UniqueIdArray(
          "ot-ticket-followups:messages-ids",
          "ot-ticket-followups",
          "followup-ids",
          "followup-ids-used",
          { allowDoubles: false, maxLength: 5 }
        ),
        //Array: ("opendiscord:panel-options","openticket","option-ids","option-ids-used",{allowDoubles:false,maxLength:25})
        //Strin: ("opendiscord:ticket-id","openticket","option-ids",{regex:/^[A-Za-z0-9-éèçàêâôûî]+$/,minLength:3,maxLength:40})
      },
    ],
  }),
});

export const ticketFollowupsMessageStructure = new api.ODCheckerArrayStructure("ot-ticket-followups:messages", {
  allowedTypes: ["object"],
  propertyChecker: new api.ODCheckerObjectStructure("ot-ticket-followups:messages", {
    children: [
      {
        key: "id",
        optional: false,
        priority: 0,
        checker: new api.ODCheckerCustomStructure_UniqueId(
          "ot-ticket-followups:message-id",
          "ot-ticket-followups",
          "followup-ids",
          { regex: /^[A-Za-z0-9-éèçàêâôûî]+$/, minLength: 3, maxLength: 40 }
        ),
      },
      {
        key: "content",
        optional: true,
        priority: 0,
        checker: new api.ODCheckerStringStructure("ot-ticket-followups:message-content", {
          minLength: 0,
          maxLength: 2000,
        }),
      },
      {
        key: "ping",
        optional: false,
        priority: 0,
        checker: new api.ODCheckerObjectStructure("ot-ticket-followups:message-ping", {
          children: [
            {
              key: "@here",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerBooleanStructure("ot-ticket-followups:message-ping-here", {}),
            },
            {
              key: "@everyone",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerBooleanStructure("ot-ticket-followups:message-ping-everyone", {}),
            },
            {
              key: "custom",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerCustomStructure_DiscordIdArray(
                "ot-ticket-followups:message-ping-custom",
                "role",
                [],
                { allowDoubles: false }
              ),
            },
          ],
        }),
      },

      {
        key: "embed",
        optional: false,
        priority: 0,
        checker: new api.ODCheckerObjectStructure("ot-ticket-followups:message-embed", {
          children: [
            {
              key: "enabled",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerBooleanStructure("ot-ticket-followups:message-embed-enabled", {}),
            },
            {
              key: "title",
              optional: true,
              priority: 0,
              checker: new api.ODCheckerObjectStructure("ot-ticket-followups:message-title", {
                children: [
                  {
                    key: "text",
                    optional: false,
                    priority: 0,
                    checker: new api.ODCheckerStringStructure("ot-ticket-followups:message-title-text", {
                      maxLength: 256,
                    }),
                  },
                  {
                    key: "url",
                    optional: false,
                    priority: 0,
                    checker: new api.ODCheckerCustomStructure_UrlString("ot-ticket-followups:message-title-url", true, {
                      allowHttp: false,
                    }),
                  },
                ],
              }),
            },
            {
              key: "description",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerStringStructure("ot-ticket-followups:message-description", {
                maxLength: 4096,
              }),
            },
            {
              key: "customColor",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerCustomStructure_HexColor("ot-ticket-followups:message-customColor", true, true),
            },
            {
              key: "fields",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerArrayStructure("ot-ticket-followups:message-fields", {
                allowedTypes: ["object"],
                propertyChecker: new api.ODCheckerObjectStructure("ot-ticket-followups:message-field", {
                  children: [
                    {
                      key: "name",
                      optional: false,
                      priority: 0,
                      checker: new api.ODCheckerStringStructure("ot-ticket-followups:message-field-name", {
                        minLength: 1,
                        maxLength: 256,
                      }),
                    },
                    {
                      key: "value",
                      optional: false,
                      priority: 0,
                      checker: new api.ODCheckerStringStructure("ot-ticket-followups:message-field-value", {
                        minLength: 1,
                        maxLength: 1024,
                      }),
                    },
                    {
                      key: "inline",
                      optional: false,
                      priority: 0,
                      checker: new api.ODCheckerBooleanStructure("ot-ticket-followups:message-field-inline", {}),
                    },
                  ],
                }),
              }),
            },
            {
              key: "image",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerCustomStructure_UrlString("opendiscord:ticket-embed-image", true, {
                allowHttp: false,
                allowedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
              }),
            },
            {
              key: "thumbnail",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerCustomStructure_UrlString("opendiscord:ticket-embed-thumbnail", true, {
                allowHttp: false,
                allowedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
              }),
            },
            {
              key: "author",
              optional: true,
              priority: 0,
              checker: new api.ODCheckerObjectStructure("ot-ticket-followups:message-author", {
                children: [
                  {
                    key: "text",
                    optional: false,
                    priority: 0,
                    checker: new api.ODCheckerStringStructure("ot-ticket-followups:message-author-text", {
                      maxLength: 256,
                    }),
                  },
                  {
                    key: "image",
                    optional: false,
                    priority: 0,
                    checker: new api.ODCheckerCustomStructure_UrlString(
                      "ot-ticket-followups:message-author-image",
                      true,
                      {
                        allowHttp: false,
                        allowedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
                      }
                    ),
                  },
                  {
                    key: "url",
                    optional: false,
                    priority: 0,
                    checker: new api.ODCheckerCustomStructure_UrlString(
                      "ot-ticket-followups:message-author-url",
                      true,
                      { allowHttp: false }
                    ),
                  },
                ],
              }),
            },
            {
              key: "footer",
              optional: true,
              priority: 0,
              checker: new api.ODCheckerObjectStructure("ot-ticket-followups:message-footer", {
                children: [
                  {
                    key: "text",
                    optional: false,
                    priority: 0,
                    checker: new api.ODCheckerStringStructure("ot-ticket-followups:message-footer-text", {
                      maxLength: 2048,
                    }),
                  },
                  {
                    key: "image",
                    optional: false,
                    priority: 0,
                    checker: new api.ODCheckerCustomStructure_UrlString(
                      "ot-ticket-followups:message-footer-image",
                      true,
                      {
                        allowHttp: false,
                        allowedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
                      }
                    ),
                  },
                ],
              }),
            },
            {
              key: "timestamp",
              optional: false,
              priority: 0,
              checker: new api.ODCheckerBooleanStructure("ot-ticket-followups:message-timestamp", {}),
            },
          ],
        }),
      },
    ],
  }),
});
