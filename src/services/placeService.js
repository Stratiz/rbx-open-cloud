//@ts-check

export default class PlaceService {
    universeId;
    baseUrl;
    #apiKey;

    constructor(universeId, apiKey) {
        this.universeId = universeId;
        this.baseUrl = `https://apis.roblox.com/universes/v1/${this.universeId}`; 
        this.#apiKey = apiKey;
    }

    getPlace(placeId) {
        return new Place(placeId, this.universeId, this.baseUrl, this.#apiKey);
    }
}

class Place {
    universeId;
    placeId;
    #baseUrl;
    #apiKey;

    constructor(placeId, universeId, baseUrl, apiKey) {
        this.universeId = universeId;
        this.placeId = placeId;
        this.#baseUrl = baseUrl + `/places/${placeId}`; 
        this.#apiKey = apiKey;
    }

    publish(versionType, fileType, content) { 
        return new Promise((resolve, reject) => {
            fetch(this.#baseUrl + "/versions" + `?versionType=${versionType}`, {
                method: "POST",
                headers: {
                    "x-api-key": this.#apiKey,
                    "content-type": `application/${fileType == "rbxlx" ? "xml" : "octet-stream"}`
                },
                body: content
            })
            .then(response => {
                response.json()
                .then((jsonData) => {
                    if (response.status == 200) {
                        resolve(jsonData);
                    } else {
                        reject(jsonData);
                    }
                })
                .catch(err => {
                    reject(response.status.toString() + " - " + response.statusText);
                })
            }).catch(err => {
                reject(err);
            });
        });
    }
}