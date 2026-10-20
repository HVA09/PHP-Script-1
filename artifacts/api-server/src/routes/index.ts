import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import authRouter from "./auth";
import userRouter from "./user";
import adminRouter from "./admin";
import { requireAdmin } from "../middlewares/adminMiddleware";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(authRouter);
router.use(userRouter);
router.use("/admin", requireAdmin, adminRouter);

export default router;
