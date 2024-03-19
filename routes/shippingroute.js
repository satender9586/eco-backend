import  express  from "express";
const router = express.Router()
import { createShipping} from "../controller/shippingController.js"

router.post("/shipping",createShipping)


export default router