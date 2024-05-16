const express = require("express");
const { userCredentialsValidiation } = require("../middleware/ZodValidiation");
const { user } = require("../Db");
const app = express();

app.use(express.json());

app.post("/userRegister", userCredentialsValidiation, async (req, res) => {
  const { name, phone, email, password } = req.body;
  const response = await user.findOne({ email });
  if (response) {
    res.status(403).json({ msg: `User with email ${email} already exists` });
  } else {
    user
      .create({
        name,
        phone,
        email,
        password,
      })
      .then(() => res.status(200).json({ msg: "User Created Succesfully" }));
  }
});

app.listen(3000);
