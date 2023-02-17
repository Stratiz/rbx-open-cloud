
// General types
export type JsonDataType = string | number | boolean | {[key : string] : JsonDataType} | JsonDataType[] | null;

// Default class
export default class CloudClient {
    constructor(universeId : number, apiKey : string);

    universeId : number;

    dataStoreService : DataStoreService;
    messagingService : MessagingService;
    placeService : PlaceService;
}

/* 
    DataStoreService
*/
// Params
interface DataStoreParams {
    scope? : string
}

interface EntryMetaData {
    "roblox-entry-attributes"? : JsonDataType,
    "roblox-entry-userids"? : number[],
}

interface ListEntriesParams extends DataStoreParams {
    prefix? : string,
    pageSize? : number,
    cursor? : string
    limit? : number
    allScopes? : boolean
}

interface SetDataParams extends EntryMetaData { 
    matchVersion? : string,
    exclusiveCreate? : boolean,
}

interface ListVersionsParams { 
    cursor? : string,
    startTime? : Date,
    endTime? : Date,
    sortOrder? : "Ascending" | "Descending",
    limit? : number,
}

interface ListDataStoresParams {
    prefix? : string,
    pageSize? : number,
    cursor? : string
}

// Responses
export type GetDataResponse = {
    data : JsonDataType | undefined,
    metaData: {
        "roblox-entry-created-time" : Date,
        "last-modified"? : Date,
        "roblox-entry-version" : string,
        "roblox-entry-attributes"? : JsonDataType,
        "roblox-entry-userids" : number[],
        "content-md5" : string,
    }
}

export type ListDataStoresResponse = {
    datastores : {name : string, createdTime : string}[],
    nextPageCursor : string
}

export type SetDataResponse = {
    version : string,
    deleted : boolean,
    contentLength : number,
    createdTime : Date,
    objectCreatedTime : Date
}

export type ListVersionsResponse = {
    versions : SetDataResponse[]
}

export type ListEntriesResponse = {
    keys : {key : string}[], nextPageCursor : string
}

export interface GetDataVersionResponse {
    "roblox-entry-attributes" : JsonDataType,
    "roblox-entry-userids" : number[],
    "last-modified" : Date,
}

// Classes
export class DataStore {
    name : string;
    universeId : number;

    list(params? : ListEntriesParams) : Promise<ListEntriesResponse>;
    get(key : string) : Promise<GetDataResponse>;
    set(key : string, value : JsonDataType, params? : SetDataParams) : Promise<SetDataResponse>;
    delete(key : string) : Promise<void>;
    increment(key : string, amount : number, params? : EntryMetaData) : Promise<GetDataResponse>;
    getVersion(key : string, versionId : string) : Promise<GetDataVersionResponse>;
    listVersions(key : string, params? : ListVersionsParams) : Promise<ListVersionsResponse>;
}

export class DataStoreService {
    universeId : number;
    baseUrl : string;

    constructor(universeId : number, apiKey : string);

    getDataStore(name : string, params? : DataStoreParams) : DataStore;

    listDataStores(params? : ListDataStoresParams) : Promise<ListDataStoresResponse>;
}

/* 
    Messaging Service
*/
// Classes
export class Topic {
    topicName : string;
    universeId : number;

    publish(message : any) : Promise<void>;
}

export class MessagingService {
    universeId : number;
    baseUrl : string;

    constructor(universeId : number, apiKey : string);

    getTopic(topicName : string) : Topic;
}

/* 
    PlaceService
*/
// Responses
export type PlacePublishResponse = {
    versionNumber : number
}

// Classes
export class Place {
    universeId : number;
    placeId : number;

    publish(versionType : "Saved" | "Published", fileType : "rbxlx" | "rbxl", content : Buffer) : Promise<PlacePublishResponse>;
}

export class PlaceService {
    universeId : number;
    baseUrl : string;

    constructor(universeId : number, apiKey : string);

    getPlace(placeId : number) : Place;
}