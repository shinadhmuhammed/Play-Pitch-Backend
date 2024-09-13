"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./FrameWorks/Routes/userRoutes"));
const ownerRoutes_1 = __importDefault(require("./FrameWorks/Routes/ownerRoutes"));
const adminRoutes_1 = __importDefault(require("./FrameWorks/Routes/adminRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbconnect_1 = __importDefault(require("./FrameWorks/Database/dbconnect"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./Business/utils/socket"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
});
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static("uploads"));
app.use("/", userRoutes_1.default);
app.use("/owner", ownerRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
(0, socket_1.default)(io);
dbconnect_1.default.once("open", () => {
    server.listen(3001, () => {
        console.log("Server started on port 3001");
    });
});
