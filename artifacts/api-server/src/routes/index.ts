import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import adminRouter from "./admin";
import contentRouter from "./content";
import adminContentRouter from "./admin-content";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(adminRouter);
router.use(contentRouter);
router.use(adminContentRouter);
router.use(storageRouter);

export default router;
