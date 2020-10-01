import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'

/* Config */
const app = express()
const port = process.env.port || 9000

/* connect to pusher */
const pusher = new Pusher({
    appId: '1076931',
    key: '7a291a4936c17b234c4f',
    secret: '927cce3c5ac49b11704a',
    cluster: 'ap1',
    encrypted: true
});

/* middleware */
app.use(express.json());
app.use(cors());

/* DB Config */
const connection_url = "mongodb://admin:PK0uVTkGR3tcXE7c@cluster0-shard-00-00.nifqq.mongodb.net:27017,cluster0-shard-00-01.nifqq.mongodb.net:27017,cluster0-shard-00-02.nifqq.mongodb.net:27017/whatsappdb?ssl=true&replicaSet=atlas-e8qtk0-shard-0&authSource=admin&retryWrites=true&w=majority"

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;

db.once("open", () => {
    console.log("DB terkoneksi");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        console.log("change occured", change);

        /* jika operationType = insert maka akan tersimpan di trigger */
        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        } else {
            console.log('Error triggering Pusher')
        }
    });
});

/* API Routing */
app.get("/", (req, res) => res.status(200).send("hai guys"));

/* method get untuk mendapatkan data */
app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

/* method post untuk menambahkan data */
app.post("/messages/new", (req, res) => {
    const dbMessage = req.body
    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

/* pemanggilan port yang berjalan di 9000*/
app.listen(port, () => console.log(`Connect pada http://localhost:${port}`))