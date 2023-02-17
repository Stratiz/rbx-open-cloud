# [rbx-open-cloud](https://github.com/Stratiz/rbx-open-cloud)
A familiar OOP wrapper for Roblox's Open Cloud API.

The goal of this project is to simplify the Open Cloud API into a familar format which mimics Roblox's in-engine API, as well as simplify some of the tedious functionality.

Contributions are much welcome!

# Docs
## Types Reference
Click below to see a lean version of all the typings and return values.

Full type file is also located [here.](./src/index.d.ts)
<details>
<summary> Expand Types </summary>

```ts
// General types
export type JsonDataType = string | number | boolean | {[key : string] : JsonDataType} | JsonDataType[] | null;

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

/* 
    PlaceService
*/

// Responses
export type PlacePublishResponse = {
    versionNumber : number
}
```
</details>
<br>

## Classes
### `class CloudClient(universeId: number, apiKey: string)`
  This is the default export of the module.
```js
import CloudClient from "rbx-open-cloud"

const client = new CloudClient(1234567890, process.env.RBLX_API_KEY)
```
#### Properties:
  - dataStoreService: `DataStoreService`
  - messagingService: `MessagingService`
  - placeService: `PlaceService`
  - universeId: `number`

<hr>

### `class DataStoreService(universeId: number, apiKey: string)`
```js
import { DataStoreService } from "rbx-open-cloud"

const newDataService = new DataStoreService(1234567890, process.env.RBLX_API_KEY)
```

#### Properties:
  - baseUrl: `string`
  - universeId: `number`

#### Methods:
  - listDataStores(params?: `ListDataStoresParams`) : `Promise<ListDataStoresResponse>`
    ```js
    const data = await newDataService.listDataStores({prefix: "Test", pageSize: 1, cursor: ""})
    ```
  - getDataStore(name: `string`, params?: `DataStoreParams`) : `DataStore`
    ```js
    const targetDataStore = newDataService.getDataStore("Test_1", {scope: "global"})
    ```

<hr>

### `class DataStore`

#### Properties:
  - name: `string`
  - universeId: `number`

#### Methods:
- list(params? : `ListEntriesParams`) : `Promise<ListEntriesResponse>`;

- get(key : `string`) : `Promise<GetDataResponse>`;
- set(key : `string`, value : `JsonDataType`, params? : `SetDataParams`) : `Promise<SetDataResponse>`;
- delete(key : `string`) : `Promise<void>`;
- increment(key : `string`, amount : `number`, params? : `EntryMetaData`) : `Promise<GetDataResponse>`;
- getVersion(key : `string`, versionId : `string`) : `Promise<GetDataVersionResponse>`;
- listVersions(key : `string`, params? : `ListVersionsParams`) : `Promise<ListVersionsResponse>`;

<hr>

### `class MessagingService(universeId: number, apiKey: string)`
```js
import { MessagingService } from "rbx-open-cloud"

const newMessageService = new MessagingService(1234567890, process.env.RBLX_API_KEY)
```

#### Properties:
  - baseUrl: `string`
  - universeId: `number`

#### Methods:
  - getTopic(topicName: `string`) : `Topic`
    ```js
    const targetTopic = newMessageService.getTopic("Topic1")
    ```

<hr>

### `class Topic`

#### Properties:
  - topicName: `string`
  - universeId: `number`

#### Methods:
  - publish(message: `string`) : `Promise<void>`
    ```js
    targetTopic.publish("Message Text")
        .then(() => {
            console.log("Sent message successfully!")
        })
        .catch(err => {
            console.log("Failed to send message")
        })
    ```

<hr>

### `class PlaceService(universeId: number, apiKey: string)`
```js
import { PlaceService } from "rbx-open-cloud"

const newPlaceService = new PlaceService(1234567890, process.env.RBLX_API_KEY)
```

#### Properties:
  - baseUrl: `string`
  - universeId: `number`

#### Methods:
  - getPlace(placeId: `number`) : `Place`
    ```js
    const targetPlace = newPlaceService.getPlace(123467)
    ```

<hr>

### `class Place`

#### Properties:
  - placeId: `number`
  - universeId: `number`

#### Methods:
  - publish(versionType: `"Saved" | "Published"`, fileType: `"rbxlx" | "rbxl"`, content: `Buffer`) : `Promise<PlacePublishResponse>`
    ```js
    import fs from "fs"

    fs.readFile("./PlaceFile.rbxl", "binary", (content) => {
        const contentBuffer = Buffer.from(content, "binary")

        targetPlace.publish("Published", "rbxl", contentBuffer)
            .then(result => {
                console.log("Place published successfully", result.versionNumber)
            })
            .catch(err => {
                console.log("Failed to publish place", err)
            })
    })

    ```
<hr>

# Examples

(TypeScript)
Update specific object entries without modifying the others, then inform the live game servers the object has been updated:
```ts
import CloudClient from "rbx-open-cloud"
import type { JsonDataType } from "rbx-open-cloud"

const robloxClient = new CloudClient(123456789, process.env.RBLX_API_KEY)

const objectDataStore = robloxClient.dataStoreService.getDataStore("ObjectData")
const serverInformer = robloxClient.messagingService.getTopic("InformServers")

export function update(objectId : string, data : { [key : string] : JsonDataType }) {
    return new Promise((resolve, reject) => {

        // Fetch the data from roblox
        objectDataStore.get(objectId)
            .then((response) => {
                // Explicitly define our data type
                const responseData = response.data as { [key : string] : JsonDataType };

                // Parse through data and update values that exist in both provided data and gotten data.
                for (const key in data) {
                    if (responseData[key] != undefined) {
                        responseData[key] = data[key];
                        console.log("Updated " + objectId + " : " + key + " to", data[key])
                    }
                }
                
                // Set the updated data
                objectDataStore.set(objectId, responseData)
                    .then(successData => {
                        // If successful, fire an message to inform servers of the update.
                        serverInformer.publish(objectId)
                            .catch(err => {
                                console.log(err);
                            });
                        
                        // Resolve with the set data response
                        resolve(successData);
                    })
                    .catch(err => {
                        console.log("Failed to set updated data:", err);
                        reject(err);
                    });
            })
            .catch(err => {
                console.log("Failed to get data:", err);
                reject(err);
            });
    });
}
```