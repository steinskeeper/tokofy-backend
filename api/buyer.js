var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get('/hello', (req, res) => {
    res.send('Hello World! Buyer')
})
router.get("/allshops", async function (req, res) {
    try {
        const allusers = await prisma.users.findMany({
            where: {
                NOT: {
                    role: "buyer",
                },
            },

        });
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
        try {
            const shop = await prisma.users.findUnique({
                where: {
                    user_id: id,
                },
                include:{
                    Items:true,
                },
            });
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

module.exports = router;