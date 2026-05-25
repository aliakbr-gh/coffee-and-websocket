const WebSocket = require("ws");

const wss = new WebSocket.Server({
    port: 8080
});

console.log("WebSocket Chat Server Started");

// Store connected users
const clients = [];

wss.on("connection", (ws) => {

    console.log("New client connected");

    // Receive message
    ws.on("message", (message) => {

        const data = JSON.parse(message);

        console.log("Received:");
        console.log(data);

        // USER JOIN
        if (data.type === "join") {
            clients.push({
                username: data.username,
                ws: ws
            });

            console.log(data.username + " joined");

            // Broadcast join message
            broadcast({
                type: "system",
                message: data.username + " joined chat"
            });
        }


        // CHAT MESSAGE
        if (data.type === "chat") {
            // Find current user
            const currentUser = clients.find((client) => {
                return client.ws === ws;
            });

            if (!currentUser) {
                return;
            }

            console.log(currentUser.username + ": " + data.message);

            // Broadcast chat
            broadcast({
                type: "chat",
                username: currentUser.username,
                message: data.message
            });
        }
    });


    // Disconnect
    ws.on("close", () => {

        console.log("Client disconnected");

        // Find disconnected user
        const disconnectedUser = clients.find((client) => {
            return client.ws === ws;
        });

        // Remove from array
        const filteredClients = clients.filter((client) => {
            return client.ws !== ws;
        });

        clients.length = 0;

        filteredClients.forEach((client) => {
            clients.push(client);
        });

        // Broadcast leave message
        if (disconnectedUser) {
            broadcast({
                type: "system",
                message: disconnectedUser.username + " left chat"
            });
        }
    });
});


// Broadcast to all users
function broadcast(data) {
    console.log("Broadcasting:");
    console.log(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}