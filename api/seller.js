var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get('/hello', (req, res) => {
    res.send('Seller!')
})

router.get(
    "/allorders/:id", async function (req, res) {
        const id = req.params.id;
        try {
            const orders = await prisma.items.findMany({
                where: {
                    user_id: parseInt(id),
                },
                select:{
                    Orders:{
                        include:{
                            user:{
                                select:{
                                    name: true,
                                    location: true
                                }
                            }
                        }
                    }
                }

            });
            res.status(200).json({
                message: "success",
                orders: orders,
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