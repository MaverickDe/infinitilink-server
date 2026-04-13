import mongoose from "mongoose";
import { Connection } from "mongoose";
import { E_DEV_ENVIRONMENT } from "../enums";


mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bux")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err)
    process.exit(1)
  })
console.log("Sssssss")
export const sandboxDB = mongoose.createConnection(
//  "mongodb://localhost:27017/buxm"
 process.env.MONGODB_URI || "mongodb://localhost:27017/bux"
);

// export const prodDB = mongoose.createConnection(
//   process.env.MONGO_PROD_URI || "mongodb://localhost:27017/bux_prod"
// );

sandboxDB.on("connected", () => {
  console.log("Sandbox MongoDB connected");
});

// prodDB.on("connected", () => {
//   console.log("Production MongoDB connected");
// });

export function getDB(mode: "sandbox" | "prod" | E_DEV_ENVIRONMENT.production |E_DEV_ENVIRONMENT.testing) {
  return (mode === "sandbox"  || mode == E_DEV_ENVIRONMENT.testing)? sandboxDB : mongoose.connection;
}
