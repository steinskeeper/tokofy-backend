var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get('/hello', (req, res) => {
    res.send('Buyer!')
})
router.get("/allshops", async function (req, res) {
    // Remove Pass from RES
    try {
        const allusers = await prisma.users.findMany({
            where: {
                NOT: {
                    role: "buyer",
                },
            },

        });
        delete allusers.password
        res.json(allusers);
    } catch (err) {
        console.log(err);
        res.status(200).json({
            status: "Failed to Get Shops",
        });
    }
});

router.get(
    "/viewshop/:id", async function (req, res) {
        const id = req.params.id;
        console.log(id)
        try {
            const shop = await prisma.users.findUnique({
                where: {
                    user_id: parseInt(id),
                },
                include:{
                    Items:true
                }
            });
            delete shop.password
            res.status(200).json({
                message: "success",
                shop: shop,
            });
        } catch (err) {
            return res.json({
                message: "error",
                details: "Failed to Reterive Data",
            });
        }
    }
);

router.get(
    "/viewitem/:id", async function (req, res) {
        const id = req.params.id;
        try {
            const item = await prisma.items.findUnique({
                where: {
                    id: parseInt(id),
                },
            });
            res.status(200).json({
                message: "success",
                item: item,
            });
        } catch (err) {
            return res.json({
                message: "error",
                details: "Failed to Reterive Data",
            });
        }
    }
);

router.post("/placeorder", async function (req, res, next) {
    try {
        const { user_id, item_id , seller_id} = req.body;


        const neworder = await prisma.orders.create({
            data: {
                user_id: parseInt(user_id),
                item_id: parseInt(item_id),
                status: "Pending",
                seller_id:parseInt(seller_id)

            },
        });
        res.status(200).json({
            order: neworder,
            message: "success",
        });
    } catch (err) {
        console.log(err);
        res.status(200).json({
            message: "Failed to Place Order",
        });
    }
});

router.get(
    "/myorders/:id", async function (req, res) {
        const id = req.params.id;
        try {
            const item = await prisma.orders.findMany({
                where: {
                    user_id: parseInt(id),
                },
                include: {
                    item: {
                        select: {
                            id: true,
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

module.exports = router;