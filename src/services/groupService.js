//@ts-check

function makeUrlParamsFromObject(obj) {
    const result = "?" + Object.keys(obj).map(key => {
        return obj[key] != undefined && `${key}=${obj[key]}` || ""
    }).join('&');

    return result == "?" ? "" : result;
}

export default class GroupService {
    groupId;
    baseUrl;
    #apiKey;

    constructor(groupId, apiKey) {
        this.groupId = groupId;
        this.baseUrl = `https://apis.roblox.com/cloud/v2/groups/${this.groupId}`;  
        this.#apiKey = apiKey;
    }

    getInfo() {
        /** @type {Promise<void>} */
        return (new Promise((resolve, reject) => {
            fetch(this.baseUrl, {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                    "content-type": "application/json"
                }
            })
            .then(response => {
                if (response.status == 200) {
                    resolve(response.json());
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

    getMembers(amount, params={}) { 
        /** @type {Promise<void>} */
        return (new Promise((resolve, reject) => {
            fetch(this.baseUrl + `/memberships` + makeUrlParamsFromObject({maxPageSize : amount , ...params}), {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                    "content-type": "application/json"
                }
            })
            .then(response => {
                if (response.status == 200) {
                    resolve(response.json());
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

    getRoles(amount, params={}) { 
        /** @type {Promise<void>} */
        return (new Promise((resolve, reject) => {
            fetch(this.baseUrl + `/roles` + makeUrlParamsFromObject({maxPageSize : amount , ...params}), {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                    "content-type": "application/json"
                }
            })
            .then(response => {
                if (response.status == 200) {
                    resolve(response.json());
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

    getShout() {
         /** @type {Promise<void>} */
         return (new Promise((resolve, reject) => {
            fetch(this.baseUrl + `/shout`, {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                    "content-type": "application/json"
                }
            })
            .then(response => {
                if (response.status == 200) {
                    resolve(response.json());
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