# [rbx-open-cloud](https://github.com/Stratiz/rbx-open-cloud)
A familiar OOP wrapper for Roblox's Open Cloud API.

The goal of this project is to simplify the Open Cloud API into a familar format which mimics Roblox's in-engine API, as well as simplify some of the tedious functionality.

Contributions are much welcome!

# Docs

## Classes
### `class CloudClient(universeId: number, apiKey: string)`
  This is the default export of the module.
```js
import CloudClient from "rbx-open-cloud"

const client = new CloudClient(process.env.RBLX_API_KEY)
```
#### Methods:
  - registerService(serviceName : `string`, `...args`) : `Service`
    ```js
    const messagingService = client.registerService("MessagingService", 1234567890)
    ```
  - getService(serviceName : `string`) : `Service`;
    ```js
    const messagingService = client.getService("MessagingService")
    ```

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
- listKeys(params? : `ListEntriesParams`) : `Promise<ListEntriesResponse>`;

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

### `class AssetService(creatorId: number, isGroup: boolean, apiKey: string)`

```js
import { AssetService } from "rbx-open-cloud"

const newAssetService = new AssetService(1234567890, false, process.env.RBLX_API_KEY)
```

#### Properties:
  - baseUrl: `string`
  - ownerId: `number`
  - isGroup: `boolean`

#### Methods:
  - create(assetType, name, fileContent, options) : `Promise<AssetCreateResponse>`
    - assetType : `"Audio" | "Decal" | "Model"`
    - name : `string`
    - fileContent : `Blob`
    - options : `{ description : string }`
  
    ```js
    const assetPromise = newAssetService.create("Audio", "NewAudio!", FileBlob, { description: "Cool new asset" })

    // Response used in .get()
    ```

  - get(operationIdPath : `string`) : `Promise<AssetGetResponse>`

    ```js
      assetPromise.then((uploadResult) => {
          let getResult = undefined;
          while (!getResult || !getResult.response) { // Roblox backend has a race condition. This is a hacky fix.
              await new Promise(r => setTimeout(r, 1000));
              getResult = await newAssetService.get(uploadResult.path)

              const unusualResult = (getResult as unknown) as {[key : string] : string};
              if (unusualResult.error) {
                  throw new Error(unusualResult.error);
              }
          }

          console.log(getResult.response.assetId);
      }).catch((err) => {
          console.log("Upload failed")
      });
    ```

  - update(assetId : `number`, fileContent : `Blob`) : `Promise<AssetCreateResponse>`
    ```js
    const assetPromise = newAssetService.update(0123456789, FileBlob)
    ```

### `class GroupService(groupId: number, apiKey: string)`

```js
import { GroupService } from "rbx-open-cloud"

const newGroupService = new GroupService(1234567890, process.env.RBLX_API_KEY)
```

#### Properties:
  - baseUrl: `string`
  - groupId: `number`

#### Methods:
  - getInfo() : `Promise<GroupInfoResponse>`
  - getMembers(amount : number, params : `GroupMemberParams` ) : `Promise<GroupMembersResponse>`
  - getRoles(amount : number, params : `GroupRolesParams`) : `Promise<GroupRolesResponse>`
  - getShout() : `Promise<GroupShoutResponse>`
