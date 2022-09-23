importScripts('https://www.gstatic.com/firebasejs/8.2.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.2/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyA5A9IX39RT9V_o8u2ID9DMyRecSaawF38",
    authDomain: "kasper-dev.firebaseapp.com",
    projectId: "kasper-dev",
    storageBucket: "kasper-dev.appspot.com",
    messagingSenderId: "1061661679594",
    appId: "1:1061661679594:web:a699007ed7f50539aadc93",
    measurementId: "G-GSF138QCLK",
});

if (firebase.messaging.isSupported()) {
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function (payload) {
        try {
            const { data } = payload;
            // console.log('[firebase-messaging-sw.js] Received background message ', payload, "data", data);

            if (data.silent !== "true") {
                // Customize notification here
                const notificationTitle = data.title;
                const notificationOptions = {
                    body: data.body,
                    icon: data.icon,
                    data: payload
                };

                self.registration.showNotification(notificationTitle,
                    notificationOptions);
            }

            sendDataToUi(data);
        } catch (e) {
            console.log("err",);
        }
    });

    self.addEventListener('notificationclick', function (event) {
        // console.log('On notification click: ', event);
        event.notification.close();

        let click_action = event.notification.data.data.click_action;

        let originUrl = new URL(event.target.origin);

        event.waitUntil(clients.matchAll({
            includeUncontrolled: true,
            type: "window"
        }).then(function (clientList) {
            if (clients.openWindow && click_action) {
                return clients.openWindow(click_action);
            }
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if ((new URL(client.url)).host == originUrl.host && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow)
                return clients.openWindow('/');
        })
            // .finally(() => {
            //     if (event.notification.data) sendDataToUi(event.notification.data);
            // })
        );
    });

    function sendDataToUi(data) {
        self.clients.matchAll({ includeUncontrolled: true }).then(function (clients) {
            console.log(clients);
            //you can see your main window client in this list.
            clients.forEach(function (client) {
                client.postMessage(data);
            });
        });
    }
}