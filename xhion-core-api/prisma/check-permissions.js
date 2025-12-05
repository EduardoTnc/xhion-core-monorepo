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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function checkPermissions() {
    return __awaiter(this, void 0, void 0, function () {
        var permiso, adminEmail, user, hasPermission;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Checking permission: sistema.configurar_empresa');
                    return [4 /*yield*/, prisma.permiso.findFirst({
                            where: { nombreAccion: 'sistema.configurar_empresa' }
                        })];
                case 1:
                    permiso = _a.sent();
                    if (!permiso) {
                        console.log('❌ Permission DOES NOT exist in DB.');
                    }
                    else {
                        console.log('✅ Permission exists:', permiso.id);
                    }
                    adminEmail = 'admin@xhion.com';
                    return [4 /*yield*/, prisma.usuario.findUnique({
                            where: { email: adminEmail },
                            include: {
                                rol: {
                                    include: {
                                        permisos: {
                                            include: {
                                                permiso: true
                                            }
                                        }
                                    }
                                }
                            }
                        })];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        console.log('❌ Admin user not found.');
                        return [2 /*return*/];
                    }
                    console.log("User Role: ".concat(user.rol.nombre));
                    hasPermission = user.rol.permisos.some(function (rp) { return rp.permiso.nombreAccion === 'sistema.configurar_empresa'; });
                    if (!hasPermission) return [3 /*break*/, 3];
                    console.log('✅ User has the permission.');
                    return [3 /*break*/, 5];
                case 3:
                    console.log('❌ User DOES NOT have the permission.');
                    if (!permiso) return [3 /*break*/, 5];
                    console.log('Attempting to assign permission...');
                    return [4 /*yield*/, prisma.rolPermiso.create({
                            data: {
                                rolId: user.rolId,
                                permisoId: permiso.id
                            }
                        })];
                case 4:
                    _a.sent();
                    console.log('✅ Permission assigned to Admin role.');
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
checkPermissions()
    .catch(function (e) { return console.error(e); })
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
