const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

const ADMIN_PASSWORD = "112233";

app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "pitch-panchayat-secret",
        resave: false,
        saveUninitialized: false
    })
);

// Serve HTML, CSS, JS and Images
app.use(express.static(__dirname));

// =================== LOGIN ===================

app.post("/login", (req, res) => {

    const password = req.body.password;

    if (password === ADMIN_PASSWORD) {

        req.session.admin = true;

        return res.sendFile(path.join(__dirname, "login_success.html"));
    }

    return res.sendFile(path.join(__dirname, "login_fail.html"));

});

// =================== ADMIN CHECK ===================

function requireAdmin(req, res, next) {

    if (req.session.admin) {
        next();
    } else {
        res.send("Access Denied");
    }

}

// =================== DASHBOARD ===================

app.get("/dashboard", requireAdmin, (req, res) => {

    res.sendFile(path.join(__dirname, "././dashboard.html"));

});

// =================== START SERVER ===================

app.listen(3000, () => {

    console.log("Server running on http://localhost:3000");

});
