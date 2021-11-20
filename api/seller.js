var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get('/hello', (req, res) => {
    res.send('Hello World! Seller')
})
module.exports = router;