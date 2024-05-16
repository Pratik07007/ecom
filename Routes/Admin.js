const express = require("express");
const { admin } = require("../Db");
const jwt = require("jsonwebtoken")
const { adminCredentialsValidiation } = require("../middleware/ZodValidiation");
const app = express();

app.use(express.json());

app.post("/adminRegister", adminCredentialsValidiation, async (req, res) => {
  const { email, password } = req.body;
  const respone = await admin.findOne({ email });
  if (respone) {
    res.status(403).json({ msg: `Admin with email ${email} already exists` });
  } else {
    admin
      .create({ email, password })
      .then(() => res.status(200).json({ msg: "Admin Created Succesfully" }));
  }
});

app.post("/adminLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await admin.findOne({ email, password });
    if (response) {
      const token = jwt.sign({ email }, "12345");
      res.status(200).json({ token });
    } else {
      res.status(203).json({ msg: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000);
