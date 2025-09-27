// Service Worker for background notifications
const CACHE_NAME = "ehr-companion-v1"
const urlsToCache = ["/", "/offline.html"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const { action, data } = event
  const { patientId, type, id } = data || {}

  if (action === "view") {
    // Open the app to view patient details
    event.waitUntil(
      clients.openWindow(`/?patient=${patientId}&type=${type}`).then((windowClient) => {
        if (windowClient) {
          windowClient.focus()
        }
      }),
    )
  } else if (action === "complete") {
    // Mark reminder as complete
    event.waitUntil(
      fetch("/api/reminders/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reminderId: id }),
      }),
    )
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow("/").then((windowClient) => {
        if (windowClient) {
          windowClient.focus()
        }
      }),
    )
  }
})

// Handle background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Sync pending data when connection is restored
    const response = await fetch("/api/sync", {
      method: "POST",
    })
    return response
  } catch (error) {
    console.error("Background sync failed:", error)
    throw error
  }
}
