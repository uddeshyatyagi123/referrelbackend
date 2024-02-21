const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const auth = require("./routes/admin")
const cookieParser = require('cookie-parser')


dotenv.config({ path: './config/.env' })
connectDB()

const app = express()
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}))
app.use(cookieParser())
app.use(express.json());


app.use("/api", auth)

const PORT = app.listen(process.env.PORT, () =>
  console.log(`SERVER UP and running at ${process.env.PORT}`)
)

// setInterval(function() {
//     console.log("Render ab nhi soyega");
// }, 2*60*1000)

app.get("/", (req, res) => {
  res.status(200).send("Server up and running")
})
