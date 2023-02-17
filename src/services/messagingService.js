//@ts-check
export default class MessagingService {
    universeId;
    baseUrl;
    #apiKey;

    constructor(universeId, apiKey) {
        this.universeId = universeId;
        this.baseUrl = `https://apis.roblox.com/messaging-service/v1/universes/${this.universeId}`; 
        this.#apiKey = apiKey;
    }

    getTopic(topicName) {
        return new MessagingTopic(topicName, this.universeId, this.baseUrl, this.#apiKey);
    }
}

class MessagingTopic {
    topicName;
    universeId;
    #baseUrl;
    #apiKey;

    constructor(topicName, universeId, baseUrl, apiKey) {
        this.topicName = topicName;
        this.universeId = universeId;
        this.#baseUrl = baseUrl;
        this.#apiKey = apiKey;
    }

    publish(data) { 
        /** @type {Promise<void>} */
        return (new Promise((resolve, reject) => {
            fetch(this.#baseUrl + `/topics/${this.topicName}`, {
                method: "POST",
                headers: {
                    "x-api-key": this.#apiKey,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "message": data
                })
            })
            .then(response => {
                if (response.status == 200) {
                    resolve();
                } else {
                    response.json().then(json => {
                        reject(json);
                    }).catch(err => {
                        reject(response.status.toString() + " - " + response.statusText);
                    });
                }
            }).catch(err => {
                reject(err);
            });
        }));
    }
}