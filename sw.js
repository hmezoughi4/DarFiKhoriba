const CACHE_NAME = "ma-maison-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./home-192.png",
    "./home-512.png"
];


/* ==================================================
   INSTALLATION DU SERVICE WORKER
================================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => {

                console.log(
                    "Mise en cache des fichiers de l'application"
                );

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    /*
     * Permet au nouveau Service Worker
     * de passer directement à l'étape d'activation.
     */
    self.skipWaiting();

});


/* ==================================================
   ACTIVATION
   Suppression des anciens caches
================================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if(key !== CACHE_NAME) {

                            console.log(
                                "Suppression ancien cache :",
                                key
                            );

                            return caches.delete(
                                key
                            );

                        }

                    })

                );

            })
            .then(() => {

                /*
                 * Le nouveau Service Worker prend
                 * immédiatement le contrôle des pages.
                 */
                return self.clients.claim();

            })

    );

});


/* ==================================================
   INTERCEPTION DES REQUETES
================================================== */

self.addEventListener("fetch", event => {

    /*
     * On ne gère que les requêtes GET.
     */
    if(event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        /*
         * On essaie d'abord Internet.
         */
        fetch(event.request)

            .then(response => {

                /*
                 * On ne met en cache que les réponses
                 * valides.
                 */
                if(
                    !response
                    ||
                    response.status !== 200
                ) {

                    return response;

                }


                /*
                 * Une réponse ne peut être consommée
                 * qu'une fois, donc on la clone.
                 */
                const responseCopy =
                    response.clone();


                caches
                    .open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            responseCopy
                        );

                    });


                return response;

            })

            .catch(() => {

                /*
                 * Si Internet n'est pas disponible,
                 * on recherche la ressource dans le cache.
                 */
                return caches
                    .match(event.request)
                    .then(cachedResponse => {

                        if(cachedResponse) {

                            return cachedResponse;

                        }


                        /*
                         * Pour une navigation hors connexion,
                         * on renvoie index.html si disponible.
                         */
                        if(
                            event.request.mode
                            ===
                            "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }

                    });

            })

    );

});
