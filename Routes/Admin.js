const express = require("express");
const { admin } = require("../Db");
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

app.listen(3000);
