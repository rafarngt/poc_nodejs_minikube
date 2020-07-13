const express = require("express");
const app = express();

app.listen(3000, function () {
    console.log("listening on 3000");
});

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.get("/delete", (req, res) => {
    res.send("Delete");
});

app.get("/update", (req, res) => {
    res.send("Update");
});

app.get("/insert", (req, res) => {
    res.send("Insert");
});
