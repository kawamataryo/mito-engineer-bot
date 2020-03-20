import * as functions from "firebase-functions";
import { expressReceiver } from "./slack/app";

const REGION = "asia-northeast1";

export const slack = functions
  .region(REGION)
  .https.onRequest(expressReceiver.app);
