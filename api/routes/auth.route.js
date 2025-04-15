import express from "express";
import { login,refresh,logout } from "../controllers/auth.controller.js";

const router=express.Router();

router.post("/login",login)
router.post("/refresh",refresh)
router.post("/logout",logout)

export default router;