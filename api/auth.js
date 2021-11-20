var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

router.get('/hello', (req, res) => {
    res.send('Auth!')
})

router.post("/login", async function (req, res, next) {
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
router.post("/addseller", async function (req, res, next) {
    try {
        const { username, password } = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newuser = await prisma.users.create({
            data: {
                username: username,
                role: "buyer",
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