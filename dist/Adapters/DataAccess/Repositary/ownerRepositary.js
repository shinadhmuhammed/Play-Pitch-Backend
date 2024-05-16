"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ownerModel_1 = __importDefault(require("../Models/ownerModel"));
const turfModel_1 = __importDefault(require("../Models/turfModel"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const findOwner = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const OwnerDatabase = yield ownerModel_1.default.findOne({ email: email });
        return OwnerDatabase;
    }
    catch (error) {
        console.log(error);
        return null;
    }
});
const updateTurf = (id, updateTurfData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = yield turfModel_1.default.findByIdAndUpdate(id, updateTurfData, { new: true });
        return update;
    }
    catch (error) {
        console.log(error);
    }
});
const acceptId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield UserModel_1.default.findById(id);
    }
    catch (error) {
        console.log(error);
    }
});
const getOwnerById = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const owner = yield ownerModel_1.default.findById(ownerId);
        return owner;
    }
    catch (error) {
        console.log(error);
    }
});
const editDetails = (ownerId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const edit = yield ownerModel_1.default.findByIdAndUpdate(ownerId, userData, { new: true });
        return edit;
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = { findOwner, updateTurf, acceptId, getOwnerById, editDetails };
