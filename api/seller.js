var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var multer = require("multer")

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
            cb(null, "./static/items");
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
    res.send('Seller!')
})

router.get(
    "/allorders/:id", async function (req, res) {
        const id = req.params.id;
        try {
            const item = await prisma.orders.findMany({
                where: {
                    seller_id: parseInt(id),
                },
                include: {
                    item: {
                        select: {
                            id: true,
                            name: true,
                        },
                    

                    },
                    user:{
                        select:{
                            name: true,
                        }

                    }
                }

            });
            res.status(200).json({
                message: "success",
                orders: item,
            });
        } catch (err) {
            return res.json({
                message: "error",
                details: "Failed to Reterive Data",
            });
        }
    }
);

router.post('/additem', async function (req, res) {
    try {
        const { name, desc,user_id, price } = req.body;

        const it = await prisma.items.create({
            data: {
                name: name,
                desc: desc,
                user_id: user_id,
                quantity: 0,
                price: price,
                image: "https://www.ikea.com/in/en/images/products/gradvis-vase-pink__0524970_pe644685_s5.jpg",

            },
        });
        res.status(200).json({
            status: "success",
            data: it,
        });
    }
    catch (err) {
        return res.json({
            message: "error",
            details: "Failed to Reterive Data",
        });
    }

});

router.post("/order-status", async function (req, res) {
    const { order_id, action } = req.body;
    console.log(req.body);
    const reqid = parseInt(order_id);
    if (action === "Accepted") {
        try {
            await prisma.orders.update({
                where: {
                    id: reqid,
                },
                data: {
                    status: "Accepted",
                },
            });

            res.status(200).json({
                status: "Successfully Accepted Order",
            });
        } catch (err) {
            return res.status(200).json({
                status: "error",
                details: "Could not update Order",
            });
        }
    } else if (action === "Rejected") {
        try {
            await prisma.transactions.update({
                where: {
                    id: reqid,
                },
                data: {
                    status: "Rejected",
                },
            });
            res.status(200).json({
                status: "Successfully Rejected Order",
            });
        } catch (err) {
            return res.status(200).json({
                status: "error",
                details: "Transaction Failed",
            });
        }
    }
});

module.exports = router;