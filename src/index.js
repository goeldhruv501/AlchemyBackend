const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./routes/Routes.js")
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

mongoose.connect(process.env.DB )
    .then(() => { console.log("mongodb connected sucessfully"); })
    .catch((err) => { console.log(err); });

app.use('/', router)

app.listen(port, () => { console.log(`server is running ${port}`); });
