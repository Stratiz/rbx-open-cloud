//@ts-check

import DataStoreService from './services/dataStoreService.js';
import MessagingService from './services/messagingService.js';
import PlaceService from './services/placeService.js';
import AssetService from './services/assetService.js';

const services = { DataStoreService, MessagingService, PlaceService, AssetService };
export { DataStoreService, MessagingService, PlaceService, AssetService };

export default class CloudClient {
    #apiKey;
    #serviceCache = {};

    constructor(apiKey) {
        this.#apiKey = apiKey;
    }

    registerService(serviceName, ...args) {
        if (!services[serviceName]) {
            throw new Error(`Service ${serviceName} does not exist.`);
        }

        const service = new services[serviceName](...args, this.#apiKey);
        this.#serviceCache[serviceName] = service;

        return service;
    }

    getService(serviceName) {
        if (this.#serviceCache[serviceName]) {
            return this.#serviceCache[serviceName];
        } else {
            throw new Error(`Service ${serviceName} is not registered.`);
        }
    }
}