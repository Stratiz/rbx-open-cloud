//@ts-check

export default class AssetService {
    ownerId;
    isGroup;
    baseUrl;
    #apiKey;

    constructor(ownerId, isGroup, apiKey) {
        this.ownerId = ownerId;
        this.isGroup = isGroup;
        this.baseUrl = `https://apis.roblox.com/assets/v1`; 
        this.#apiKey = apiKey;
    }

    create(assetType, name, fileContent, options={}) { 

        const creator = {}
        if (!this.isGroup) {
            creator.userId = this.ownerId;
        } else {
            creator.groupId = this.ownerId; 
        }

        const form = new FormData();
        form.append("request", JSON.stringify({
            assetType : assetType,
            displayName : name,
            description : options.description || "Created from Cloud API",
            creationContext : {
                creator
            }
        }));

        form.append("fileContent", fileContent);

        return new Promise((resolve, reject) => {
            fetch(this.baseUrl + "/assets", {
                method: "POST",
                headers: {
                    "x-api-key": this.#apiKey
                },
                body: form
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

    update(assetId, fileContent) { 
        const form = new FormData();
        form.append("request", JSON.stringify({
            assetId
        }));

        form.append("fileContent", fileContent);

        return new Promise((resolve, reject) => {
            fetch(this.baseUrl + `/assets`, {
                method: "PATCH",
                headers: {
                    "x-api-key": this.#apiKey
                },
                body: form
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

    get(operationPath) {
        return new Promise((resolve, reject) => {
            fetch(this.baseUrl + `/${operationPath}`, {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey
                }
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