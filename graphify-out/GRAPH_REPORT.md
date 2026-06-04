# Graph Report - bajaj-part-2  (2026-06-04)

## Corpus Check
- 144 files · ~248,329 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 468 nodes · 562 edges · 17 communities detected
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `toast()` - 27 edges
2. `POST()` - 22 edges
3. `GET()` - 19 edges
4. `addDcNumber()` - 6 edges
5. `sanitizeText()` - 6 edges
6. `handleSubmit()` - 6 edges
7. `useAuth()` - 6 edges
8. `getCurrentUserFromDb()` - 6 edges
9. `addConfirmedData()` - 5 edges
10. `getAdminDashboardDataAction()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `extractDataFromImage()` --calls--> `handleImageReady()`  [INFERRED]
  src\app\actions.ts → src\app\page.tsx
- `loadFromDatabase()` --calls--> `getDcNumbersAction()`  [INFERRED]
  src\app\page.tsx → src\app\actions\db-actions.ts
- `addDcNumber()` --calls--> `toast()`  [INFERRED]
  src\app\tag-entry\page.tsx → src\hooks\use-toast.ts
- `addConfirmedData()` --calls--> `addDataToSheetAction()`  [INFERRED]
  src\app\page.tsx → src\app\actions\sheet-actions.ts
- `exportToCSV()` --calls--> `toast()`  [INFERRED]
  src\app\page.tsx → src\hooks\use-toast.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (53): getAdminDashboardDataAction(), getAdminDcNumberAnalyticsAction(), getAdminPartCodeAnalyticsAction(), getUserTodayEntryCountsAction(), deleteConsolidatedDataEntryAction(), findConsolidatedDataEntryByPartCodeAndSrNoAction(), findConsolidatedDataEntryByProductSrNoAction(), getAllConsolidatedDataEntriesAction() (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (38): handleConfirmUpload(), handleUploadClick(), bulkCreateScrapEntriesAction(), exportTagEntriesToExcel(), addConfirmedData(), confirmAddDuplicate(), exportToCSV(), handleAddToSheet() (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (25): createOrUpdateUserInDb(), getAccessToken(), getCurrentUserFromDb(), getJWKS(), getSession(), getUserBySupabaseId(), isJwtFormat(), resetPasswordForEmail() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (8): EventEmitter, bulkInsertConsolidatedDataAction(), parseExcelFileAction(), handleFileUpload(), handleSave(), handleClear(), handleDelete(), handleSubmit()

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (14): getAdminDcNumbersAction(), addDcNumberAction(), getDcNumbersAction(), loadDcNumbersFromDb(), loadDcPartCodesFromDb(), addDcNumber(), handleKeyDown(), handleKeyUp() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (12): importBomFromExcel(), importBomFromJson(), importBomFromCsv(), importBomFromExcel(), importBomFromJson(), sanitizeText(), uploadBomExcelAction(), handleFileSelect() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (9): generatePcbNumber(), getPcbNumberForDc(), parseMfgMonthYear(), searchConsolidatedDataEntriesByPcb(), formatDate(), handleFind(), handleSelectResult(), mapEntryToDetails() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (10): ConsumptionTab(), DispatchTab(), DashboardLayout(), useAuth(), useFirebase(), useFirebaseApp(), useFirestore(), useUser() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.26
Nodes (9): generateFileName(), getImageSavePath(), saveCapturedImage(), saveImageToFile(), getDevices(), handleKeyDown(), startCamera(), stopCamera() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.23
Nodes (10): getConsolidatedDataEntries(), updateConsolidatedDataEntryAction(), loadSavedEntries(), handleCancel(), handleEntryDeleted(), handleEntrySaved(), handleKeyDown(), handleSave() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (8): extractDataFromImage(), generateFileName(), getImageSavePath(), saveCapturedImage(), saveImageToFile(), translateExtractedData(), extractData(), translateData()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (4): initializeDatabaseOnStartup(), initDB(), initializeDatabase(), initDB()

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (2): handleCustomKeyDown(), handleCustomSubmit()

### Community 13 - "Community 13"
Cohesion: 0.53
Nodes (4): buildAuthObject(), buildErrorMessage(), buildRequestObject(), FirestorePermissionError

### Community 14 - "Community 14"
Cohesion: 0.7
Nodes (4): generateFileName(), getImageSavePath(), saveCapturedImageAction(), saveImageToFile()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (2): dataUrlToBlob(), extractBase64Data()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): useAuth(), useSessionData()

## Knowledge Gaps
- **Thin community `Community 12`** (6 nodes): `fetchEngineers()`, `handleCustomChange()`, `handleCustomKeyDown()`, `handleCustomSubmit()`, `handleSelectChange()`, `engineer-name-db.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (5 nodes): `dataUrlToBlob()`, `extractBase64Data()`, `generateFileName()`, `isValidDataUrl()`, `camera-utils-client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (4 nodes): `AuthProvider()`, `useAuth()`, `useSessionData()`, `AuthContext.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `toast()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.220) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `handleFind()` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `toast()` (e.g. with `loadSheetsFromDatabase()` and `addDcNumber()`) actually correct?**
  _`toast()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `POST()` (e.g. with `resetPasswordForEmail()` and `handleCorsPreflight()`) actually correct?**
  _`POST()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `GET()` (e.g. with `getAdminDashboardDataAction()` and `uploadBomExcelAction()`) actually correct?**
  _`GET()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `addDcNumber()` (e.g. with `addDcNumberAction()` and `toast()`) actually correct?**
  _`addDcNumber()` has 4 INFERRED edges - model-reasoned connections that need verification._