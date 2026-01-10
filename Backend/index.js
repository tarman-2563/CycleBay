import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import userRouter from "./routes/user.router.js";
import productRouter from "./routes/product.router.js";
import offerRoutes from "./routes/offer.router.js";
import messageRouter from "./routes/message.router.js";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import "./db/connection.js";  

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://taupe-scone-41941e.netlify.app"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('userTyping', {
            userId: data.userId,
            isTyping: data.isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/message", messageRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/offer', offerRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something broke!',
        error: err.message 
    });
});

app.use("/", (req, res) => {
    res.status(200).send("Application is running");
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/404.html"));
});

server.listen(3000, (err) => {
    if(err) console.log("err", err);
    console.log("server listening on 3000");
});