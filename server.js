const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const app = express();

/*
  middlewares
*/
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

/*
  db connection
*/

const MONGO_DB_URL =
  "mongodb+srv://dbUser:5Tl4PdCVlysHVuhW@cluster0.7edcod3.mongodb.net/myDb?retryWrites=true&w=majority";
mongoose.connect(MONGO_DB_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to database: "));
db.once("open", () => {
  console.log("Mongo DB connected successfully.");
});

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: String,
  image: String,
  description: String,
  price: Number,
});

const OrderSchema = new Schema({
  customerName: String,
  deliveryAddress: String,
  orderCode: String,
  orderItems: Array,
  orderTotal: Number,
  orderDate: { type: Date, default: Date.now },
  orderStatus: String,
  proofOfDelivery: String,
  driverEmailId: String,
});

const DriverSchema = new Schema({
  name: String,
  email: String,
  password: String,
  vehiclemodel: String,
  vehiclecolor: String,
  licenceplatenumber: String,
  activeOrders: Number,
});

const Item = mongoose.model("item_collection", ItemSchema);
const Order = mongoose.model("order_collection", OrderSchema);
const Driver = mongoose.model("driver", DriverSchema);

/*
  restaurant endpoints
*/

app.get("/", async (req, res) => {
  try {
    const result = await Item.find().lean().exec();

    res.render("restaurant/restaurant", {
      layout: false,
      items: result,
    });
  } catch (error) {
    console.error("Error: ", error);
  }
});

app.get("/create-item", async (req, res) => {
  const item =
    // {
    //   name: "Grilled Chicken",
    //   image: "https://images.unsplash.com/photo-1579888944884-c7fc5a553848?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3087&q=80",
    //   description: "Delight in the perfection of a grilled chicken, its succlent tenderness and creating a memorable culinary experience",
    //   price: 28.99,
    // }
    // {
    //   name: "Kimchi Fried Rice",
    //   image: "https://images.unsplash.com/photo-1600688654899-379ec76aca42?ixlib=rb",
    //   description: "Savor the explosive harmony of flavors in kimchi freid rice",
    //   price: 21.99
    // }
    // {
    //   name: "French Fries",
    //   image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb",
    //   description: "Indulge in the crispy golden perfection of French fries",
    //   price: 8.99
    // }
    // {
    //   name: "Special Taco",
    //   image: "https://images.unsplash.com/photo-1604467715878-83e57e8bc129?ixlib=rb",
    //   description: "2 pieces of special taco with fresh vegatables",
    //   price: 12.99
    // }
    // {
    //   name: "Cheese burger",
    //   image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb",
    //   description: "Dive into the ultimate indulgence with a double meat cheeseburger",
    //   price: 18.99
    // }
    // {
    //   name: "Bibimbap",
    //   image: "https://images.unsplash.com/photo-1639321905636-c1c0e71fb467?ixlib=rb",
    //   description: "Bibimbap, a harmonious blend of meticulously seasoned vegatables, savory meat, and a perfectly fried egg",
    //   price: 21.99
    // }
    // {
    //   name: "Bacon and eggs",
    //   image: "https://images.unsplash.com/photo-1606851094291-6efae152bb87?ixlib=rb",
    //   description: "Indulge in the classic comfort of our Bacon and Eggs breakfast",
    //   price: 11.99
    // }
    {
      name: "Peperoni pizza",
      image:
        "https://images.unsplash.com/photo-1525518392674-39ba1fca2ec2?ixlib=rb",
      description: "Delight in the savory perfection of our Pepperoni Pizza",
      price: 24.99,
    };
  try {
    const result = await new Item(item).save();

    return res.send(result);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.get("/remove-item/:itemId", async (req, res) => {
  try {
    const result = await Item.findOne({ _id: req.params.itemId });
    if (result === null) {
      return res.send("Cannot find item with that id");
    }
    const id = await result.deleteOne();
    return res.send(`Deleted: ${id}`);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.post("/orderForm", (req, res) => {
  const orderItems = JSON.parse(req.body.items);
  let subtotal = 0;

  for (let i = 0; i < orderItems.length; i++) {
    subtotal += parseFloat(orderItems[i].price);
  }

  res.render("restaurant/orderForm", {
    layout: false,
    orderItems: orderItems,
    subtotal: subtotal,
  });
});

app.post("/orderStatus", (req, res)=> {
  res.render("orderStatus", {layout: false}); 
});

app.get("/create-order", async (req, res) => {
  const items = await Item.find().lean().exec();
  console.log(items);
  const order = {
    customerName: "Eminem",
    deliveryAddress: "2 Three Winds Dr. North York, Toronto, ON",
    orderCode: "M04",
    orderItems: ["6521ea2032fb8c2dee0a3d54"],
    orderTotal: 8.99,
    orderStatus: "In Transit",
    proofOfDelivery: "",
    driverEmailId: "harsh17",
  };
  try {
    const result = await new Order(order).save();
    console.log(result);
    return res.send(result);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.get("/remove-order/:orderId", async (req, res) => {
  try {
    const result = await Order.findOne({ _id: req.params.orderId });
    if (result === null) {
      return res.send("Cannot find order with that id");
    }
    const id = await result.deleteOne();
    return res.send(`Deleted: ${id}`);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

/*
  order endpoints
*/

const getOrders = async (orders) => {
  const orderList = [];

  for (order of orders) {
    try {
      let isReceived = false;
      let driverName = "";
      let driverLicensePlate = "";

      const driver = await Driver.findOne({ email: order.driverEmailId });

      if (driver) {
        driverName = driver.name;
        driverLicensePlate = driver.licenceplatenumber;
      }
      if (order.orderStatus === "Received") {
        isReceived = true;
      }

      const orderDate = new Date(order.orderDate);
      const orderDateTime = `${orderDate.getFullYear()}-${
        orderDate.getMonth() + 1
      }-${orderDate.getDate()} ${orderDate.getHours()}:${orderDate.getMinutes()}`;

      const statusesColor = {
        Received: "#f39c12",
        "Available For Delivery": "#27ae60",
        "In Transit": "#2980b9",
        Delivered: "#2c3e50",
      };
      orderList.push({
        _id: order._id,
        customerName: order.customerName,
        deliveryAddress: order.deliveryAddress,
        orderItems: order.orderItems,
        orderCode: order.orderCode,
        orderTotal: order.orderTotal,
        orderDate: orderDateTime,
        orderStatus: order.orderStatus,
        orderStatusColor: statusesColor[order.orderStatus],
        proofOfDelivery: order.proofOfDelivery,
        driverEmailId: order.driverEmailId,
        driverName: driverName,
        driverLicensePlate: driverLicensePlate,
        isReceived: isReceived,
      });
    } catch (err) {
      throw new Error(`Cannot find driver for ${order.orderCode} - ${err}`);
    }
  }
  return orderList;
};

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort("-orderDate").lean().exec();
    const orderList = await getOrders(orders);
    res.render("orders", {
      layout: false,
      orders: orderList,
    });
  } catch (error) {
    res.render("orders", {
      layout: false,
      orders: [],
      errorMsg: `Error: Cannot list Orders at the moment - ${error}`,
    });
  }
});

app.post("/orders", async (req, res) => {
  const customerName = req.body.customerName;
  if (customerName) {
    try {
      const orders = await Order.find({ customerName })
        .collation({ locale: "en", strength: 2 })
        .sort("-orderDate")
        .lean()
        .exec();
      const orderList = await getOrders(orders);
      return res.render("orders", {
        layout: false,
        orders: orderList,
      });
    } catch (error) {
      return res.render("orders", {
        layout: false,
        orders: [],
      });
    }
  }
  res.redirect("/orders");
});

app.post("/orders/update/:orderCode/:status", async (req, res) => {
  const orderCode = req.params.orderCode;
  const status = req.params.status;
  try {
    const orderToUpdate = await Order.findOne({ orderCode: orderCode });

    if (orderToUpdate === null) {
      return res.send("ERROR: Could not find matching order");
    }

    await orderToUpdate.updateOne({ orderStatus: status });

    res.redirect("/orders");
  } catch (error) {
    console.log(error);
    return res.send("ERROR: Could not update order");
  }
});

app.get("/orders/update/:orderCode/:status", async (req, res) => {
  const orderCode = req.params.orderCode;
  const status = req.params.status;
  try {
    const orderToUpdate = await Order.findOne({ orderCode: orderCode });

    if (orderToUpdate === null) {
      return res.send("ERROR: Could not find matching order");
    }

    await orderToUpdate.updateOne({ orderStatus: status });

    res.redirect("/orders");
  } catch (error) {
    console.log(error);
    return res.send("ERROR: Could not update order");
  }
});

/*
  delivery endpoints
*/

const onHttpStart = () => {
  console.log(`Express web server running on port: ${HTTP_PORT}`);
  console.log(`Press CTRL+C to exit`);
};

app.listen(HTTP_PORT, onHttpStart);
