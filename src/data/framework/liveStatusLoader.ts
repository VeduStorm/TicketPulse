import {opendiscord, api, utilities} from "../../index"

export const loadAllLiveStatusSources = async () => {
    //DEFAULT DJDJ DEV
    opendiscord.livestatus.add(new api.ODLiveStatusUrlSource("opendiscord:default-djdj-dev","https://raw.githubusercontent.com/open-discord-bots/open-ticket/refs/heads/dev/src/livestatus.json"))
}