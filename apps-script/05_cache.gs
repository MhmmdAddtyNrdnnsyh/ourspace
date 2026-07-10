var CACHEABLE_SHEET_TTLS = Object.freeze({
  sticky_notes: 30,
  date_plans: 30,
  gallery: 30,
  shared_lists: 30,
  backups: 30,
})

var HEADER_CACHE_TTL_SECONDS = 21600
var MAX_SCRIPT_CACHE_VALUE_LENGTH = 80000
var ourspaceRequestRowsCache = Object.create(null)
var ourspaceRequestHeadersCache = Object.create(null)
var ourspaceRequestSheetsCache = Object.create(null)

function beginRequestContext() {
  ourspaceRequestRowsCache = Object.create(null)
  ourspaceRequestHeadersCache = Object.create(null)
  ourspaceRequestSheetsCache = Object.create(null)
}

function hasRequestCacheEntry(cache, key) {
  return Object.prototype.hasOwnProperty.call(cache, key)
}

function getSheetRowsCacheKey(sheetName) {
  return 'ourspace:v1:rows:' + sheetName
}

function getSheetHeadersCacheKey(sheetName) {
  return 'ourspace:v1:headers:' + sheetName
}

function readScriptJsonCache(key) {
  try {
    var value = CacheService.getScriptCache().get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('cache:read:error ' + key + ' ' + String(error))
    return null
  }
}

function writeScriptJsonCache(key, value, ttlSeconds) {
  try {
    var serialized = JSON.stringify(value)

    if (serialized.length > MAX_SCRIPT_CACHE_VALUE_LENGTH) {
      console.log('cache:skip-large ' + key + ' ' + String(serialized.length))
      return
    }

    CacheService.getScriptCache().put(key, serialized, ttlSeconds)
  } catch (error) {
    console.error('cache:write:error ' + key + ' ' + String(error))
  }
}

function deleteScriptCacheKey(key) {
  try {
    CacheService.getScriptCache().remove(key)
  } catch (error) {
    console.error('cache:delete:error ' + key + ' ' + String(error))
  }
}

function getSharedSheetRows(sheetName) {
  if (!CACHEABLE_SHEET_TTLS[sheetName]) {
    return null
  }

  return readScriptJsonCache(getSheetRowsCacheKey(sheetName))
}

function setSharedSheetRows(sheetName, rows) {
  var ttlSeconds = CACHEABLE_SHEET_TTLS[sheetName]

  if (!ttlSeconds) {
    return
  }

  writeScriptJsonCache(getSheetRowsCacheKey(sheetName), rows, ttlSeconds)
}

function invalidateRequestSheetCache(sheetName) {
  delete ourspaceRequestRowsCache[sheetName]
}

function invalidateSharedSheetCache(sheetName) {
  if (CACHEABLE_SHEET_TTLS[sheetName]) {
    deleteScriptCacheKey(getSheetRowsCacheKey(sheetName))
  }
}

function invalidateSheetCaches(sheetName) {
  invalidateRequestSheetCache(sheetName)
  invalidateSharedSheetCache(sheetName)
}

function updateRequestCachedRow(sheetName, rowNumber, headers, values) {
  if (!hasRequestCacheEntry(ourspaceRequestRowsCache, sheetName)) {
    return
  }

  var cachedRow = ourspaceRequestRowsCache[sheetName].find(function (row) {
    return row.rowNumber === rowNumber
  })

  if (!cachedRow) {
    invalidateRequestSheetCache(sheetName)
    return
  }

  headers.forEach(function (header, index) {
    cachedRow[header] = values[index]
  })
}

function appendRequestCachedRow(sheetName, rowNumber, headers, values) {
  if (!hasRequestCacheEntry(ourspaceRequestRowsCache, sheetName)) {
    return
  }

  var cachedRow = { rowNumber: rowNumber }

  headers.forEach(function (header, index) {
    cachedRow[header] = values[index]
  })
  ourspaceRequestRowsCache[sheetName].push(cachedRow)
}

function getCachedHeaders(sheetName) {
  if (hasRequestCacheEntry(ourspaceRequestHeadersCache, sheetName)) {
    return ourspaceRequestHeadersCache[sheetName]
  }

  var headers = readScriptJsonCache(getSheetHeadersCacheKey(sheetName))

  if (Array.isArray(headers) && headers.length > 0) {
    ourspaceRequestHeadersCache[sheetName] = headers
    return headers
  }

  return null
}

function setCachedHeaders(sheetName, headers) {
  ourspaceRequestHeadersCache[sheetName] = headers
  writeScriptJsonCache(
    getSheetHeadersCacheKey(sheetName),
    headers,
    HEADER_CACHE_TTL_SECONDS,
  )
}

function invalidateHeadersCache(sheetName) {
  delete ourspaceRequestHeadersCache[sheetName]
  deleteScriptCacheKey(getSheetHeadersCacheKey(sheetName))
}
