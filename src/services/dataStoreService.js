//@ts-check
import crypto from 'crypto';

const META_DATA_HEADERS = [
    "roblox-entry-created-time",
    "last-modified",
    "roblox-entry-version",
    "roblox-entry-attributes",
    "roblox-entry-userids",
    "content-md5",
];

function parseMetaData(metaData) {
    for (const key in metaData) {
        if (key == "roblox-entry-attributes" || key == "roblox-entry-userids") {
            metaData[key] = JSON.parse(metaData[key]);
        } else if (key == "roblox-entry-created-time" || key == "last-modified") {
            metaData[key] = new Date(metaData[key]);
        }
    }
}

function makeUrlParamsFromObject(obj) {
    const result = "?" + Object.keys(obj).map(key => {
        return obj[key] != undefined && `${key}=${obj[key]}` || ""
    }).join('&');

    return result == "?" ? "" : result;
}

function cleanHeadersObject(obj) {
    for (const key in obj) {
        if (obj[key] == undefined) {
            delete obj[key];
        }
    }
}

function handleFetchResponse(response, resolve, reject) {
    response.json()
    .then((jsonData) => {
        if (response.status == 200) {
            resolve(jsonData);
        } else {
            reject(jsonData);
        }
    })
    .catch(err => {
        if (response.status == 200) {
            resolve();
        } else {
            reject(response.status.toString() + " - " + response.statusText);
        }
    })
}

/** DataStoreService Class for a universeId */ 
export default class DataStoreService {
    universeId;
    baseUrl;
    #apiKey;
    
    /**
     * @param {number} universeId - The universeId of the game
     * @param {string} apiKey - The API key to use for the requests
     */
    constructor(universeId, apiKey) {
        this.baseUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores`
        this.#apiKey = apiKey;
        this.universeId = universeId;
    }

    /**
     * Lists all datastores in a universe
     */
    listDataStores(params={}) {
        return new Promise((resolve, reject) => {
            fetch(this.baseUrl + makeUrlParamsFromObject(params), {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                }
            })
            .then(response => handleFetchResponse(response, resolve, reject))
            .catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Gets a datastore by name
     */
    getDataStore(name, params={}) {
        return new DataStore(name, this.universeId, this.baseUrl, this.#apiKey, params);
    }
}

class DataStore {
    name;
    universeId;
    params;
    #baseUrl;
    #apiKey;

    constructor(name, universeId, baseUrl, apiKey, params={}) {
        this.name = name;
        this.#baseUrl = baseUrl;
        this.#apiKey = apiKey;
        this.universeId = universeId;
        this.params = params;
    }
    
    listKeys(params={}) {
        return new Promise((resolve, reject) => {
            fetch(this.#baseUrl + "/datastore/entries" +  makeUrlParamsFromObject({
                datastoreName : this.name,
                scope : params.scope || this.params.scope,
                ...params
            }), {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                }
            })
            .then(response => handleFetchResponse(response, resolve, reject))
            .catch(err => {
                reject(err);
            });
        });
    }

    get(entryKey) {
        return new Promise((resolve, reject) => {
            fetch(this.#baseUrl + "/datastore/entries/entry" + makeUrlParamsFromObject({
                datastoreName : this.name,
                entryKey : entryKey,
                scope : this.params.scope
            }), {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                }
            })
            .then(response => {
                function resolveProxy(data) {
                    const metaData = {}
                    for (const metaDataEntry of META_DATA_HEADERS) {
                        if (response.headers.has(metaDataEntry)) {
                            metaData[metaDataEntry] = response.headers.get(metaDataEntry);
                        }
                    }

                    parseMetaData(metaData);

                    resolve({data, metaData});
                }

                handleFetchResponse(response, resolveProxy, reject)
            })
            .catch(err => {
                reject(err);
            });
        });
    }

    set(entryKey, data, params={}) {
        return new Promise((resolve, reject) => {
            const dataJson = JSON.stringify(data);

            const headers = {
                "x-api-key": this.#apiKey,
                "Content-Type": "application/json",
                "content-md5": crypto.createHash("md5").update(dataJson).digest().toString("base64")
            }
            headers["roblox-entry-attributes"] = JSON.stringify(params["roblox-entry-attributes"]);
            headers["roblox-entry-userids"] = JSON.stringify(params["roblox-entry-userids"]);

            cleanHeadersObject(headers);

            fetch(this.#baseUrl + "/datastore/entries/entry" + makeUrlParamsFromObject({
                datastoreName : this.name,
                entryKey : entryKey,
                scope : this.params.scope,
                ...params
            }), {
                method: "POST",
                headers,
                body: dataJson
            })
            .then(response => {
                function resolveProxy(data) {
                    data.createdTime = new Date(data.createdTime);
                    data.objectCreatedTime = new Date(data.objectCreatedTime);
                    
                    resolve(data);
                }

                handleFetchResponse(response, resolveProxy, reject)
            })
            .catch(err => {
                reject(err);
            });
        });
    }
    
    delete(entryKey) {
        /** @type {Promise<void>} */
        return (new Promise((resolve, reject) => {
            fetch(this.#baseUrl + "/datastore/entries/entry" + makeUrlParamsFromObject({
                datastoreName : this.name,
                entryKey : entryKey,
                scope : this.params.scope
            }), {
                method: "DELETE",
                headers: {
                    "x-api-key": this.#apiKey,
                }
            })
            .then(response => {
                if (response.status == 204) {
                    resolve();
                } else {
                    handleFetchResponse(response, resolve, reject)
                }
            })
            .catch(err => {
                reject(err);
            });
        }));
    }

    increment(entryKey, amount, params={}) { 
        return new Promise((resolve, reject) => {
            const headers = {
                "x-api-key": this.#apiKey,
            }

            headers["roblox-entry-attributes"] = JSON.stringify(params["roblox-entry-attributes"]);
            headers["roblox-entry-userids"] = JSON.stringify(params["roblox-entry-userids"]);

            cleanHeadersObject(headers);

            fetch(this.#baseUrl + "/datastore/entries/entry/increment" + makeUrlParamsFromObject({
                datastoreName : this.name,
                entryKey : entryKey,
                scope : this.params.scope,
                incrementBy : amount
            }), {
                method: "POST",
                headers
            })
            .then(response => {
                function resolveProxy(data) {
                    const metaData = {}
                    for (const metaDataEntry of META_DATA_HEADERS) {
                        if (response.headers.has(metaDataEntry)) {
                            metaData[metaDataEntry] = response.headers.get(metaDataEntry);
                        }
                    }

                    parseMetaData(metaData);

                    resolve({data, metaData});
                }

                handleFetchResponse(response, resolveProxy, reject)
            })
            .catch(err => {
                reject(err);
            });
        });
    }


    getVersion(entryKey, versionId) {
        return new Promise((resolve, reject) => {
            fetch(this.#baseUrl + "/datastore/entries/entry/versions/version" + makeUrlParamsFromObject({
                datastoreName : this.name,
                entryKey : entryKey,
                scope : this.params.scope,
                versionId
            }), {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                }
            })
            .then(response => {
                function resolveProxy(data) {
                    parseMetaData(data)
                    resolve(data);
                }

                handleFetchResponse(response, resolveProxy, reject)
            })
            .catch(err => {
                reject(err);
            });
        });
    }

    listVersions(entryKey, params={}) {
        return new Promise((resolve, reject) => {
            if (params.startTime) {
                params.startTime = params.startTime.toISOString();
            }
            if (params.endTime) {
                params.endTime = params.endTime.toISOString();
            }

            fetch(this.#baseUrl + "/datastore/entries/entry/versions" + makeUrlParamsFromObject({
                datastoreName : this.name,
                entryKey : entryKey,
                scope : this.params.scope,
                ...params
            }), {
                method: "GET",
                headers: {
                    "x-api-key": this.#apiKey,
                }
            })
            .then(response => handleFetchResponse(response, resolve, reject))
            .catch(err => {
                reject(err);
            });
        });
    }
}