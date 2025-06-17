// const express = require('express')
// const dotenv = require('dotenv')
// const cors = require('cors')
// const connectDB = require('./config/db')
// const auth = require("./routes/admin")
// const cookieParser = require('cookie-parser')


// dotenv.config({ path: './config/.env' })
// connectDB()

// const app = express()
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:5173',],
//   credentials: true
// }))
// app.use(cookieParser())
// app.use(express.json());


// app.use("/api", auth)

// const PORT = app.listen(process.env.PORT, () =>
//   console.log(`SERVER UP and running at ${process.env.PORT}`)
// )

// // setInterval(function() {
// //     console.log("Render ab nhi soyega");
// // }, 2*60*1000)

// app.get("/", (req, res) => {
//   res.status(200).send("Server up and running")
// })


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const auth = require("./routes/admin");
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config({ path: './config/.env' });

// Connect to database
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api", auth);

app.get("/", (req, res) => {
  res.status(200).send("Server up and running");
});

// Export the app for Vercel serverless deployment
module.exports = app;
