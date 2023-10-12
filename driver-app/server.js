const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8081;
const path = require("path");
const { engine } = require("express-handlebars");
const session = require("express-session");
const multer = require("multer");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const mongoose = require("mongoose");
// const { request } = require("http");

const myStorage = multer.diskStorage({
  destination: "./public/proof-images/",
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: myStorage });

// const CONNECTION_STRING = "mongodb+srv://dbUser:PJ9LYafUrMXt1Xsi@cluster0.7edcod3.mongodb.net/myDb?retryWrites=true&w=majority";

const CONNECTION_STRING =
  "mongodb+srv://dbUser:5Tl4PdCVlysHVuhW@cluster0.7edcod3.mongodb.net/myDb?retryWrites=true&w=majority";
mongoose.connect(CONNECTION_STRING);

// // check if connection was successful
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to database: "));
db.once("open", () => {
  console.log("Mongo DB connected successfully.");
});

const Schema = mongoose.Schema;
const driverSchema = new Schema({
  name: String,
  email: String,
  password: String,
  vehiclemodel: String,
  vehiclecolor: String,
  licenceplatenumber: String,
  activeOrders: Number,
  totalEarnings: Number,
});
const Driver = mongoose.model("driver", driverSchema);
const OrderSchema = new Schema({
  customerName: String,
  deliveryAddress: String,
  orderCode: String,
  orderItems: Array,
  orderTotal: Number,
  orderDate: Date,
  orderStatus: String,
  proofOfDelivery: String,
  driverEmailId: String,
});
const Order = mongoose.model("order_collection", OrderSchema);

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("views", "./views");
app.set("view engine", ".hbs");

app.use(
  session({
    secret: "Random string",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
  })
);

const ensureLogin = (req, res, next) => {
  if (
    req.session.isLoggedIn !== undefined &&
    req.session.isLoggedIn &&
    req.session.user !== undefined
  ) {
    next();
  } else {
    return res.redirect("/login");
  }
};

// Setup a route on the 'root' of the url to redirect to /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Display the login html page
app.get("/login", function (req, res) {
  res.render("login", { layout: "layout.hbs" });
});

app.post("/login", async (req, res) => {
  const emailFromUI = req.body.email;
  const passwordFromUI = req.body.password;

  if (
    emailFromUI === undefined ||
    passwordFromUI === undefined ||
    emailFromUI === "" ||
    passwordFromUI === ""
  ) {
    //show error is username or password is not provided or retrieved from form
    return res.render("login", {
      errorMsg: "Missing Credentials",
      layout: "layout.hbs",
    });
  }

  //if all the inputs are in valid format
  //compare the credentials with existing users
  //run database query to select any matching user
  const result = await Driver.findOne({
    email: emailFromUI,
    password: passwordFromUI,
  })
    .lean()
    .exec();
  if (result !== undefined && result !== "" && result !== null) {
    //valid login

    console.log(`Login successful for ${result.email}`);

    //before redirecting user to dashboard, save any necessary information in session
    req.session.user = {
      email: result.email,
      name: result.name,
      totalEarnings: result.totalEarnings,
      activeOrders: result.activeOrders,
    };

    req.session.isLoggedIn = true;
    req.session.email = result.email;

    //redirect the user to home page or dashboard upon successful login
    res.redirect("/available");
  } else {
    //invalid login
    return res.render("login", {
      errorMsg: "Invalid credentials. Please try again!",
      layout: "layout.hbs",
    });
  }
});

app.get("/register", (req, res) => {
  res.render("register.hbs", { layout: "layout.hbs" });
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.fullname;
  const vehicleModel = req.body.vehicleModel;
  const vehicleColor = req.body.color;
  const licencePlateNumber = req.body.numberplate;
  const activeOrders = 0;
  const totalEarnings = 0;

  const driverToInsert = new Driver({
    name: name,
    email: email,
    password: password,
    vehiclecolor: vehicleColor,
    vehiclemodel: vehicleModel,
    licenceplatenumber: licencePlateNumber,
    activeOrders: activeOrders,
    totalEarnings: totalEarnings,
  });

  if (
    name === undefined ||
    email === undefined ||
    password === undefined ||
    vehicleModel === undefined ||
    vehicleColor === undefined ||
    licencePlateNumber === undefined ||
    name === "" ||
    email === "" ||
    password === "" ||
    vehicleColor === "" ||
    vehicleModel === "" ||
    licencePlateNumber === ""
  ) {
    return res.render("register.hbs", {
      layout: "layout.hbs",
      errorMsg: "Fill Out all the fields to Register!!",
    });
  }

  const result = await Driver.find({ email: email }).lean().exec();
  if (result.length === 0) {
    try {
      await driverToInsert.save();
      return res.redirect("/login");
    } catch (err) {
      console.log(err);
    }
  } else {
    return res.render("register.hbs", {
      layout: "layout.hbs",
      errorMsg:
        "Email-Id already exists, Login or enter a different Email-Id to continue.!!",
    });
  }
});

app.get("/available", ensureLogin, async (req, res) => {
  const result = await Order.find({
    driverEmailId: "",
    orderStatus: "Available For Delivery",
  })
    .lean()
    .exec();
  const driverProfile = await Driver.findOne({ email: req.session.email });
  return res.render("available.hbs", {
    layout: "layout.hbs",
    result: result,
    name: req.session.user.name,
    total: driverProfile.totalEarnings,
    activeOrders: req.session.user.activeOrders,
    loggedIn: true,
  });
});

app.get("/picked", ensureLogin, async (req, res) => {
  const result = await Order.find({
    driverEmailId: req.session.email,
    orderStatus: "In Transit",
  })
    .lean()
    .exec();
  const driverProfile = await Driver.findOne({ email: req.session.email });
  return res.render("picked.hbs", {
    layout: "layout.hbs",
    result: result,
    name: req.session.user.name,
    total: driverProfile.totalEarnings,
    activeOrders: req.session.user.activeOrders,
    loggedIn: true,
  });
});

app.get("/available/:error", ensureLogin, async (req, res) => {
  const result = await Order.find({
    driverEmailId: "",
    orderStatus: "Available For Delivery",
  })
    .lean()
    .exec();
  const driverProfile = await Driver.findOne({ email: req.session.email });
  const errorMsg = req.params.error;
  res.render("available.hbs", {
    layout: "layout.hbs",
    result: result,
    name: req.session.user.name,
    total: driverProfile.totalEarnings,
    activeOrders: req.session.user.activeOrders,
    errorMsg: errorMsg,
    loggedIn: true,
  });
});

app.get("/picked/:error", ensureLogin, async (req, res) => {
  const result = await Order.find({
    driverEmailId: req.session.email,
    orderStatus: "In Transit",
  })
    .lean()
    .exec();
  const driverProfile = await Driver.findOne({ email: req.session.email });
  const errorMsg = req.params.error;
  res.render("picked.hbs", {
    layout: "layout.hbs",
    result: result,
    name: req.session.user.name,
    total: driverProfile.totalEarnings,
    activeOrders: req.session.user.activeOrders,
    errorMsg: errorMsg,
    loggedIn: true,
  });
});

app.get("/available/:orderId", (req, res) => {
  res.render("404.hbs", { layout: false });
});

app.post("/available/:orderId", ensureLogin, async (req, res) => {
  const orderCode = req.params.orderId;
  const driverProfile = await Driver.findOne({ email: req.session.email });
  const status = "In Transit";
  let activeOrder = driverProfile.activeOrders;
  if (activeOrder < 3) {
    try {
      const orderToUpdate = await Order.findOne({ orderCode: orderCode });

      if (orderToUpdate === null) {
        return res.send("ERROR: Could not find matching order");
      }
      activeOrder = activeOrder + 1;
      await orderToUpdate.updateOne({
        orderStatus: status,
        driverEmailId: req.session.email,
      });
      await driverProfile.updateOne({ activeOrders: activeOrder });

      return res.redirect("/available");
    } catch (error) {
      return res.send("ERROR: Could not update order");
    }
  } else {
    const errorMsg =
      "!!!Maximum Limit Reached Finish picked deliveries to pick more!!! ";
    res.redirect(`/available/${errorMsg}`);
  }
});

app.get("/picked/:orderId", (req, res) => {
  res.render("404.hbs", { layout: false });
});

app.post(
  "/picked/:orderId",
  ensureLogin,
  upload.single("proof"),
  async (req, res) => {
    const orderCode = req.params.orderId;
    const driverProfile = await Driver.findOne({ email: req.session.email });
    const status = "Delivered";
    let totalEarning = driverProfile.totalEarnings;
    let activeOrder = driverProfile.activeOrders;

    const formFile = req.file;
    if (req.file === undefined) {
      const errorMsg =
        "!!!Cannot Deliver without uploading proof of delivery!!! ";
      return res.redirect(`/picked/${errorMsg}`);
    } else {
      try {
        const orderToUpdate = await Order.findOne({
          orderCode: orderCode,
          driverEmailId: req.session.email,
        });
        if (orderToUpdate === null) {
          return res.send("ERROR: Could not find matching order");
        }
        activeOrder = activeOrder - 1;
        totalEarning = totalEarning + 10;
        const proofOfDelivery = `/proof-images/${formFile.filename}`;
        await orderToUpdate.updateOne({
          orderStatus: status,
          proofOfDelivery: proofOfDelivery,
        });
        await driverProfile.updateOne({
          activeOrders: activeOrder,
          totalEarnings: totalEarning,
        });

        return res.redirect("/available");
      } catch (error) {
        return res.send("ERROR: Something went wrong!!");
      }
    }
  }
);

app.get("/orderhistory", ensureLogin, async (req, res) => {
  const result = await Order.find({
    driverEmailId: req.session.email,
    orderStatus: "Delivered",
  })
    .lean()
    .exec();
  const driverProfile = await Driver.findOne({ email: req.session.email });
  return res.render("history.hbs", {
    layout: "layout.hbs",
    result: result,
    name: req.session.user.name,
    total: driverProfile.totalEarnings,
    loggedIn: true,
  });
});

app.get("/proof/:orderCode", ensureLogin, async (req, res) => {
  const result = await Order.findOne({ orderCode: req.params.orderCode });
  res.redirect(`${result.proofOfDelivery}`);
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

const onHttpStart = () => {
  console.log(`The web server has started at http://localhost:${HTTP_PORT}`);
  console.log("Press CTRL+C to stop the server.");
};
app.listen(HTTP_PORT, onHttpStart);
