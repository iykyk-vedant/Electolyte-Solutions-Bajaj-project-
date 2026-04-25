# Graph Report - bajaj-part-2  (2026-04-25)

## Corpus Check
- 138 files · ~168,376 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 447 nodes · 525 edges · 19 communities detected
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 22 edges
2. `toast()` - 19 edges
3. `GET()` - 17 edges
4. `addDcNumber()` - 6 edges
5. `handleSubmit()` - 6 edges
6. `getCurrentUserFromDb()` - 6 edges
7. `addConfirmedData()` - 5 edges
8. `getAdminDashboardDataAction()` - 5 edges
9. `getConsolidatedDataEntriesPaginatedAction()` - 5 edges
10. `getDcNumbersAction()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `handleUploadClick()` --calls--> `toast()`  [INFERRED]
  src\components\tag-entry\BulkScrapTab.tsx → src\hooks\use-toast.ts
- `handleImageReady()` --calls--> `extractDataFromImage()`  [INFERRED]
  src\app\page.tsx → src\app\actions.ts
- `loadFromDatabase()` --calls--> `getDcNumbersAction()`  [INFERRED]
  src\app\page.tsx → src\app\actions\db-actions.ts
- `addDcNumber()` --calls--> `toast()`  [INFERRED]
  src\app\tag-entry\page.tsx → src\hooks\use-toast.ts
- `addConfirmedData()` --calls--> `addDataToSheetAction()`  [INFERRED]
  src\app\page.tsx → src\app\actions\sheet-actions.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (40): getAdminDashboardDataAction(), getAdminDcNumberAnalyticsAction(), getAdminPartCodeAnalyticsAction(), getUserTodayEntryCountsAction(), deleteConsolidatedDataEntryAction(), findConsolidatedDataEntryByPartCodeAndSrNoAction(), findConsolidatedDataEntryByProductSrNoAction(), getAllConsolidatedDataEntriesAction() (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (24): createOrUpdateUserInDb(), getAccessToken(), getCurrentUserFromDb(), getJWKS(), getSession(), getUserBySupabaseId(), isJwtFormat(), resetPasswordForEmail() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (26): exportTagEntriesToExcel(), addConfirmedData(), confirmAddDuplicate(), exportToCSV(), handleAddToSheet(), handleCreateNewSheet(), handleDeleteSheet(), handleExportExcel() (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (15): getAdminDcNumbersAction(), addDcNumberAction(), getDcNumbersAction(), loadDcNumbersFromDb(), loadDcPartCodesFromDb(), addDcNumber(), handleKeyDown(), handleKeyUp() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (9): handleConfirmUpload(), handleUploadClick(), bulkCreateScrapEntriesAction(), saveConsolidatedData(), handleConsume(), EventEmitter, handleClear(), handleDelete() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (10): handleFind(), generatePcbNumber(), getPcbNumberForDc(), parseMfgMonthYear(), searchConsolidatedDataEntriesByPcb(), formatDate(), handleFind(), handleSelectResult() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (9): DispatchTab(), DashboardLayout(), useAuth(), useFirebase(), useFirebaseApp(), useFirestore(), useUser(), useToast() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (11): validateBomComponents(), validateConsumption(), cleanComponentText(), formatComponentConsumption(), formatValidatedComponents(), parseComponents(), validateComponent(), validateConsumption() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.26
Nodes (9): generateFileName(), getImageSavePath(), saveCapturedImage(), saveImageToFile(), getDevices(), handleKeyDown(), startCamera(), stopCamera() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.21
Nodes (7): handleChange(), handleClear(), handleClearForm(), handleDelete(), handlePageChange(), loadPageData(), validateBomAnalysis()

### Community 10 - "Community 10"
Cohesion: 0.23
Nodes (10): getConsolidatedDataEntries(), updateConsolidatedDataEntryAction(), loadSavedEntries(), handleCancel(), handleEntryDeleted(), handleEntrySaved(), handleKeyDown(), handleSave() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (8): extractDataFromImage(), generateFileName(), getImageSavePath(), saveCapturedImage(), saveImageToFile(), translateExtractedData(), extractData(), translateData()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (4): initializeDatabaseOnStartup(), initDB(), initializeDatabase(), initDB()

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (2): handleCustomKeyDown(), handleCustomSubmit()

### Community 15 - "Community 15"
Cohesion: 0.53
Nodes (4): buildAuthObject(), buildErrorMessage(), buildRequestObject(), FirestorePermissionError

### Community 16 - "Community 16"
Cohesion: 0.47
Nodes (4): importBomFromCsv(), importBomFromExcel(), importBomFromJson(), importBom()

### Community 17 - "Community 17"
Cohesion: 0.7
Nodes (4): generateFileName(), getImageSavePath(), saveCapturedImageAction(), saveImageToFile()

### Community 19 - "Community 19"
Cohesion: 0.5
Nodes (2): dataUrlToBlob(), extractBase64Data()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (2): useAuth(), useSessionData()

## Knowledge Gaps
- **Thin community `Community 14`** (6 nodes): `fetchEngineers()`, `handleCustomChange()`, `handleCustomKeyDown()`, `handleCustomSubmit()`, `handleSelectChange()`, `engineer-name-db.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (5 nodes): `dataUrlToBlob()`, `extractBase64Data()`, `generateFileName()`, `isValidDataUrl()`, `camera-utils-client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (4 nodes): `AuthProvider()`, `useAuth()`, `useSessionData()`, `AuthContext.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `toast()` connect `Community 2` to `Community 8`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Why does `handleFind()` connect `Community 5` to `Community 2`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `searchConsolidatedDataEntriesByPcb()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `POST()` (e.g. with `resetPasswordForEmail()` and `handleCorsPreflight()`) actually correct?**
  _`POST()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `toast()` (e.g. with `loadSheetsFromDatabase()` and `addDcNumber()`) actually correct?**
  _`toast()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `GET()` (e.g. with `getAdminDashboardDataAction()` and `POST()`) actually correct?**
  _`GET()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `addDcNumber()` (e.g. with `addDcNumberAction()` and `toast()`) actually correct?**
  _`addDcNumber()` has 4 INFERRED edges - model-reasoned connections that need verification._