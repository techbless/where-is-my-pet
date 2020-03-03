import { Router } from "express";
import MarkerController from "../controllers/marker";

const router: Router = Router();

router.get("/", MarkerController.getMarkers);
router.post("/", MarkerController.addMarker.bind(MarkerController));
router.delete("/:m_id", MarkerController.deleteMarker);

export default router;
