var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
var multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
            cb(null, "./static/shop");
        }

        else {
            console.log(file.mimetype);
            cb({ error: "Mime type not supported" });
        }
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        var date_now = new Date();
        let dd = String(date_now.getDate()).padStart(2, "0")
        let mm = String(date_now.getMonth() + 1).padStart(2, "0")
        let yy = date_now.getFullYear()
        let timestamp = dd + "-" + mm + "-" + yy + "";
        cb(
            null,
            file.originalname + "-" + file.fieldname + "-" + timestamp + "." + extension
        );
    }
});
var upload = multer({ storage: storage });

router.get('/hello', (req, res) => {
    res.send('Auth!')
})

router.post("/sellerlogin", async function (req, res, next) {
    const { username, password } = req.body;
    const user = await prisma.users.findUnique({
        where: {
            username: username,
        },
    });
    if (user === null) {
        res.json("User not in DB");
    }
    else {
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                message: "success",
                user: user,
            });

        } else {
            res.json({
                status: "Wrong Password",
            });
        }
    }
});
router.post("/buyerlogin", async function (req, res, next) {
    const { username, password } = req.body;
    const user = await prisma.users.findUnique({
        where: {
            username: username,
        },
    });
    if (user === null) {
        res.json("User not in DB");
    }
    else {
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                message: "success",
                user: user,
            });

        } else {
            res.json({
                status: "Wrong Password",
            });
        }
    }
});
router.post("/addbuyer", async function (req, res, next) {
    try {
        const { username, password,name,location } = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newuser = await prisma.users.create({
            data: {
                username: username,
                role: "buyer",
                password: encryptedPassword,
                name:name,
                location:location
            },
        });
        res.status(200).json({
            user: newuser,
            message: "success",
        });
    } catch (err) {
        console.log(err);
        res.status(200).json({
            message: "Failed to add Buyer",
        });
    }
});
router.post("/addseller", [upload.any()], async function (req, res, next) {
    try {
        const file = req.files;
        const itemimg = file.slice(-1);
        const cred = JSON.parse(req.body.cred);
        const encryptedPassword = await bcrypt.hash(cred.password, 10);

        const newuser = await prisma.users.create({
            data: {
                username: cred.username,
                role: "seller",
                desc:cred.desc,
                name:cred.name,
                category:cred.category,
                location: cred.location,
                banner: itemimg[0].path,
                picture: itemimg[0].path,
                password: encryptedPassword,
            },
        });
        res.status(200).json({
            user: newuser,
            message: "success",
        });
    } catch (err) {
        console.log(err);
        res.status(200).json({
            message: "Failed to add Seller",
        });
    }
});


module.exports = router;