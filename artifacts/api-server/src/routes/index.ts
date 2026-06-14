import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import profilesRouter from "./profiles";
import feedbackRouter from "./feedback";
import premiumRouter from "./premium";
import actionsRouter from "./actions";
import adminRouter from "./admin";
import { aiLimiter, feedbackLimiter, strictLimiter } from "../middlewares/security";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ai", aiLimiter, aiRouter);
router.use("/profiles", profilesRouter);
router.use("/feedback", feedbackLimiter, feedbackRouter);
router.use("/premium", strictLimiter, premiumRouter);
router.use("/actions", actionsRouter);
router.use("/admin", adminRouter);

export default router;
