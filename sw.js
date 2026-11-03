const CACHE_NAME = "ma-maison-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./home-192.png",
    "./home-512.png"
];


/* Installation */

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


/* Activation */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if(key !== CACHE_NAME) {

                            return caches.delete(key);

                        }

                    })

                );

            })

    );

    self.clients.claim();

});


/* Requêtes réseau */

self.addEventListener("fetch", event => {

    if(event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)

            .then(response => {

                const copy =
                    response.clone();

                caches
                    .open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            copy
                        );

                    });

                return response;

            })

            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});
