const express = require("express");
const app = express();
const path = require("path");

const postRoutes = require("./routes/post-routes");
const requestLogger = require("./middleware/request-logger");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const cors = require('cors');


// Middleware
app.use(express.json());
app.use(cors());
app.use(requestLogger);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api", postRoutes);


app.use(notFound);


app.use(errorHandler);

module.exports = app; 
