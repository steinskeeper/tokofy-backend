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
                    user: {
                        select: {
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
        const { name, desc, user_id, price } = req.body;

        const it = await prisma.items.create({
            data: {
                name: name,
                desc: desc,
                user_id: parseInt(user_id),
                quantity: 0,
                price: parseInt(price),
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

router.get('/dashboard/:id', async function (req, res) {
    try {

        const id = req.params.id;
        const order = await prisma.orders.findMany({
            where: {
                seller_id: parseInt(id),
                status: "Accepted"
            },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true,
                    },


                },
                user: {
                    select: {
                        name: true,
                    }

                }
            }


        });
        function group_by_month(data) {
            var months = {}
            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                var date = new Date(obj.updatedAt);
                var month = date.getMonth();
                if (months[month]) {
                    months[month].push(obj);
                }
                else {
                    months[month] = [obj];
                }
            }
            return months;
        }


        result = group_by_month(order);
        console.log("Items of October are ", result[9].length)
        console.log("Items of November are ", result[10].length)
        let percent = ((result[10].length - result[9].length) / (result[9].length)) * 100
        res.status(200).json({
            status: "success",
            percentage: percent

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
router.post("/prediction", async function (req, res) {
    const {itemid,month} = req.body
    console.log(itemid);
    try {
      const orders = await prisma.orders.findMany({});
      //console.log(orders);
      const roiOrders = orders.filter((item) => {
        if (item["item_id"] === itemid) return item;
      });
      //console.log(roiOrders);
      const test = roiOrders.reduce((acc, item) => {
        //console.log(acc);
        acc[item.createdAt.getMonth() + 1] = [
          ...(acc[item.createdAt.getMonth() + 1] || []),
          item,
        ];
        return acc;
      }, {});
      const keys = Object.keys(test);
      console.log(keys); // 10 , 11
      let finall = [];
      for (let i = 0; i < keys.length; i++) {
        const allOrdersMonth = test[keys[i]];
        finall.push({
          ItemID: itemid,
          Sales: allOrdersMonth.length,
          Month: parseInt(keys[i]),
        });
      }
  
      console.log(finall);
      function convertToCSV(arr) {
        const array = [Object.keys(arr[0])].concat(arr)
      
        return array.map(it => {
          return Object.values(it).toString()
        }).join('\n')
      }
      let csvdata = (JSON.stringify(finall))
      console.log(csvdata)
      var spawn = require("child_process").spawn;
        var process = spawn('python', ["./pred.py",
            itemid,
            month,csvdata]);
        process.stdout.on('data', function (data) {
            res.json(data.toString());
        })


    } catch (err) {
      console.log(err);
      return res.json({
        message: "error",
        details: "Failed to Reterive Data",
      });
    }
  });
/*
router.post('/prediction', async function (req, res) {
    try {
        const { month, user_id, item_id } = req.body;
        const allitems = await prisma.items.findMany({
            where: {
                user_id: user_id
            },
            include: {
                Orders: true,
            }


        });
        console.log(allitems)


        var spawn = require("child_process").spawn;
        var process = spawn('python', ["./pred.py",
            item_id,
            month]);
        process.stdout.on('data', function (data) {
            console.log(data.toString());
        })
        var result = allitems.map(item => 
           

            (

            { item_id: item.id, sales: item.Orders.length, month: 10}));

        console.log(result)
        console.log(mon)
        res.json(allitems)
        


    }
    catch (err) {
        return res.json({
            message: "error",
            details: "Failed to Reterive Data",
        });
    }

});*/




module.exports = router;