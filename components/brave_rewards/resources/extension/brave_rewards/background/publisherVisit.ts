/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const mediaType = 'youtube'

export interface PublisherVisitData {
  url: string
  channelId: string
  publisherKey: string
  publisherName: string
  mediaKey?: string
  favIconUrl?: string
}

interface PublisherVisitResponse {
  mediaType: string
  pathType: 'channel' | 'custom' | 'user' | 'video'
  errorMessage?: string
  data: PublisherVisitData | null
}

const getMediaDurationFromParts = (searchParams: URLSearchParams) => {
  const stParam = searchParams.get('st')
  const etParam = searchParams.get('et')
  if (!stParam || !etParam) {
    return 0
  }

  const startTimes = stParam.split(',')
  if (!startTimes || startTimes.length === 0) {
    return 0
  }

  const endTimes = etParam.split(',')
  if (!endTimes || endTimes.length === 0) {
    return 0
  }

  if (startTimes.length !== endTimes.length) {
    return 0
  }

  // Combine all of the intervals (should only be one set if there were no seeks)
  let duration = 0
  for (let i = 0; i < startTimes.length; ++i) {
    const st = parseFloat(startTimes[i])
    const et = parseFloat(endTimes[i])
    duration += Math.round(et - st)
  }

  return duration
}

const getMediaIdFromParts = (searchParams: URLSearchParams) => {
  return searchParams.get('docid') || ''
}

const handlePublisherVisitChannelPath = (tabId: number, mediaType: string, data: PublisherVisitData) => {
  console.info('Visited a channel url:')
  console.info(`  tabId=${tabId}`)
  console.info(`  mediaType=${mediaType}`)
  console.info(`  url=${data.url}`)
  console.info(`  channelId=${data.channelId}`)
  console.info(`  publisherKey=${data.publisherKey}`)
  console.info(`  publisherName=${data.publisherName}`)
  console.info(`  favIconUrl=${data.favIconUrl}`)

  chrome.braveRewards.savePublisherVisitChannel(
    tabId,
    mediaType,
    data.url,
    data.channelId,
    data.publisherKey,
    data.publisherName,
    data.favIconUrl || '')
}

const handlePublisherVisitCustomPath = (tabId: number, mediaType: string, data: PublisherVisitData) => {
  console.info('Visited a custom url:')
  console.info(`  tabId=${tabId}`)
  console.info(`  mediaType=${mediaType}`)
  console.info(`  url=${data.url}`)
  console.info(`  channelId=${data.channelId}`)
  console.info(`  publisherKey=${data.publisherKey}`)
  console.info(`  publisherName=${data.publisherName}`)
  console.info(`  favIconUrl=${data.favIconUrl}`)

  chrome.braveRewards.savePublisherVisitCustom(
    tabId,
    mediaType,
    data.url,
    data.channelId,
    data.publisherKey,
    data.publisherName,
    data.favIconUrl || '')
}

const handlePublisherVisitUserPath = (tabId: number, mediaType: string, data: PublisherVisitData) => {
  console.info('Visited a user url:')
  console.info(`  tabId=${tabId}`)
  console.info(`  mediaType=${mediaType}`)
  console.info(`  url=${data.url}`)
  console.info(`  channelId=${data.channelId}`)
  console.info(`  publisherKey=${data.publisherKey}`)
  console.info(`  publisherName=${data.publisherName}`)
  console.info(`  mediaKey=${data.mediaKey}`)

  chrome.braveRewards.savePublisherVisitUser(
    tabId,
    mediaType,
    data.url,
    data.channelId,
    data.publisherKey,
    data.publisherName,
    data.mediaKey || '')
}

const handlePublisherVisitVideoPath = (tabId: number, mediaType: string, data: PublisherVisitData) => {
  console.info('Visited a video url:')
  console.info(`  tabId=${tabId}`)
  console.info(`  mediaType=${mediaType}`)
  console.info(`  url=${data.url}`)
  console.info(`  channelId=${data.channelId}`)
  console.info(`  publisherKey=${data.publisherKey}`)
  console.info(`  publisherName=${data.publisherName}`)
  console.info(`  mediaKey=${data.mediaKey}`)
  console.info(`  favIconUrl=${data.favIconUrl}`)

  const mediaKey = data.mediaKey
  if (!mediaKey) {
    console.error('Failed to handle publisher visit: missing media key')
    return
  }

  chrome.braveRewards.getMediaPublisherInfo(mediaKey, (result: number, info?: RewardsExtension.Publisher) => {
    console.debug(`getMediaPublisherInfo: result=${result}`)

    if (result === 0 && info) {
      chrome.braveRewards.getPublisherPanelInfo(
        tabId,
        mediaType,
        data.url,
        data.channelId,
        data.publisherKey,
        data.publisherName,
        data.favIconUrl || '')
      return
    }

    // No publisher info for this video, fetch it from oembed interface
    if (result === 9) {
      chrome.braveRewards.savePublisherVisitVideo(
        tabId,
        mediaType,
        data.url,
        data.channelId,
        data.publisherKey,
        data.publisherName,
        mediaKey,
        data.favIconUrl || '')
      return
    }
  })
}

export const handlePublisherVisit = (mediaType: string, pathType: string, visitData: PublisherVisitData, windowId: number, tabId: number) => {
  switch (pathType) {
    case 'channel': {
      handlePublisherVisitChannelPath(tabId, mediaType, visitData)
      break
    }
    case 'user': {
      handlePublisherVisitUserPath(tabId, mediaType, visitData)
      break
    }
    case 'video': {
      handlePublisherVisitVideoPath(tabId, mediaType, visitData)
      break
    }
    case 'custom': {
      handlePublisherVisitCustomPath(tabId, mediaType, visitData)
      break
    }
  }
}

chrome.webRequest.onCompleted.addListener(
  // Listener
  function (details) {
    if (details) {
      const url = new URL(details.url)
      const searchParams = new URLSearchParams(url.search)

      const mediaId = getMediaIdFromParts(searchParams)
      const mediaKey = '' // TODO(erogul): buildMediaKey(mediaId)
      const duration = getMediaDurationFromParts(searchParams)

      chrome.braveRewards.getMediaPublisherInfo(mediaKey, (result: number, info?: RewardsExtension.Publisher) => {
        console.debug(`getMediaPublisherInfo: result=${result}`)

        if (result === 0 && info) {
          console.info('Updating media duration:')
          console.info(`  tabId=${details.tabId}`)
          console.info(`  url=${details.url}`)
          console.info(`  publisherKey=${info.publisher_key}`)
          console.info(`  mediaId=${mediaId}`)
          console.info(`  mediaKey=${mediaKey}`)
          console.info(`  favIconUrl=${info.favicon_url}`)
          console.info(`  publisherName=${info.name}`)
          console.info(`  duration=${duration}`)

          chrome.braveRewards.updateMediaDuration(
            details.tabId,
            mediaType,
            details.url,
            info.publisher_key || '',
            info.name || '',
            mediaId,
            mediaKey,
            info.favicon_url || '',
            duration)
          return
        }

        // No publisher info for this video, fetch it from oembed interface
        if (result === 9) {
          // fetchPublisherInfoFromOembed(details.tabId, details.url)
          return
        }
      })
    }
  },
  // Filters
  {
    types: [
      'image',
      'media',
      'script',
      'xmlhttprequest'
    ],
    urls: [
      'https://www.youtube.com/api/stats/watchtime?*'
    ]
  })

chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (!sender || !sender.tab || !msg) {
    return
  }

  const windowId = sender.tab.windowId
  if (!windowId) {
    return
  }

  const tabId = sender.tab.id
  if (!tabId) {
    return
  }

  const response = msg as PublisherVisitResponse

  if (!response.data) {
    console.error(`Failed to retrieve publisher visit data: ${response.errorMessage}`)
    return
  }

  handlePublisherVisit(response.mediaType, response.pathType, response.data, windowId, tabId)
})
