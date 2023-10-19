import serviceAccount from "../firebase.config.js"
import admin from "firebase-admin"
import crypto from "crypto"
import config from "../config.js"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://adastratodo-default-rtdb.europe-west1.firebasedatabase.app/",
})

export const path = (key) => {
  key = key + config.salt
  return crypto.createHash("sha256").update(key).digest("hex")
}

export const load = async (userId) => {
  let dir = path(userId)
  const userRef = database.ref("data/" + dir)
  let data = await userRef.once("value")
  return data.val()
}

export const database = admin.database()
