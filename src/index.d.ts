
// General types
export type JsonDataType = string | number | boolean | {[key : string] : JsonDataType} | JsonDataType[] | null;
type Service = DataStoreService | MessagingService | PlaceService | AssetService

// Default class
export default class CloudClient {
    constructor(apiKey : string);

    registerService : (serviceName : string, ...args) => Service;
    getService : (serviceName : string) => Service;
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

    listKeys(params? : ListEntriesParams) : Promise<ListEntriesResponse>;
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
    versionnumber : number
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

/*
    AssetService
*/
// Responses
interface AssetCreateResponse {
    path : string,
    metadata : string,
    done : boolean,
    error : {
        code : number,
        message : string
        details : string[]
    }
}

interface AssetGetResponse {
    path : string,
    done : boolean,
    response : {
        "@type" : string,
        assetType : string,
        assetId : string,
        creationContext : {
            expectedPrice? : number,
            creator : {
                userId? : number,
                groupId? : number
            }
        }
        description : string,
        displayName : string,
        path : string,
        revisionId : string,
        revisionCreateTime : string
    }
    
}
// Classes
export class AssetService {
    ownerId : number;
    isGroup : boolean;
    baseUrl : string;

    constructor(creatorId : number, isGroup : boolean, apiKey : string);

    create(assetType : "Audio" | "Decal" | "Model", name : string, fileContent : Blob, options? : {description? : string} ) : Promise<AssetCreateResponse>;

    update(assetId : number, fileContent : Blob) : Promise<AssetCreateResponse>;

    get(operationIdPath : string) : Promise<AssetGetResponse>;
}

/*
    
    GroupService

*/
// Responses
interface GroupInfoResponse {
    path: string,
    createTime: string,
    updateTime: string,
    id: string,
    displayName: string,
    description: string,
    owner: string,
    memberCount: number,
    publicEntryAllowed: boolean,
    locked: boolean,
    verified: boolean
}

interface GroupMemberResponse {
    groupMemberships: [
      {
        path: string,
        createTime: string,
        updateTime: string,
        user: string,
        role: string
      }
    ],
    nextPageToken: string
}
interface GroupRolesResponse {
    groupRoles: [
      {
        path: string,
        createTime: string,
        updateTime: string,
        id: string,
        displayName: string,
        description: string,
        rank: number,
        memberCount: number,
        permissions: {
          viewWallPosts: boolean,
          createWallPosts: boolean,
          deleteWallPosts: boolean,
          viewGroupShout: boolean,
          createGroupShout: boolean,
          changeRank: boolean,
          acceptRequests: boolean,
          exileMembers: boolean,
          manageRelationships: boolean,
          viewAuditLog: boolean,
          spendGroupFunds: boolean,
          advertiseGroup: boolean,
          createAvatarItems: boolean,
          manageAvatarItems: boolean,
          manageGroupUniverses: boolean,
          viewUniverseAnalytics: boolean,
          createApiKeys: boolean,
          manageApiKeys: boolean
        }
      }
    ],
    nextPageToken: string
}

interface GroupShoutResponse {
    path: string,
    createTime: string,
    updateTime: string,
    content: string,
    poster: string
}

// Params

interface GroupMemberParams {
    pageToken? : string,
    filter? : string
}

interface GroupRolesParams {
    pageToken? : string
}

// Classes
export class GroupService {
    groupId : number;
    baseUrl : string;

    constructor(groupId : number, apiKey : string);

    getInfo() : Promise<GroupInfoResponse>;

    getMembers(amount : number, params? : GroupMemberParams) : Promise<GroupMemberResponse>;

    getRoles(amount : number, params? : GroupRolesParams) : Promise<GroupRolesResponse>;

    getShout() : Promise<GroupShoutResponse>;
}