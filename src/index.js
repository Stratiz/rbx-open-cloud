//@ts-check

import DataStoreService from './services/dataStoreService.js';
import MessagingService from './services/messagingService.js';
import PlaceService from './services/placeService.js';

export { DataStoreService, MessagingService, PlaceService };

export default class CloudClient {
    universeId;
    dataStoreService;
    messagingService;
    placeService;
    #apiKey;

    constructor(universeId, apiKey) {
        this.universeId = universeId;
        this.#apiKey = apiKey;
        this.dataStoreService = new DataStoreService(this.universeId, this.#apiKey);
        this.messagingService = new MessagingService(this.universeId, this.#apiKey);
        this.placeService = new PlaceService(this.universeId, this.#apiKey);
    }
}