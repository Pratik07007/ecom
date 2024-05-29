const zod = require("zod");

const adminCredentialsValidiation = (req, res, next) => {
  const body = req.body;
  const userSchema = zod.object({
    email: zod.string().email(),
    password: zod
      .string()
      .min(8, "Password must be at least 8 character Long")
      .max(16, "Password cannot be more than 16 character long")
      .regex(/[A-Z]/, "Password must contain at least one upper case character")
      .regex(/[0-9]/, "Password must contain one number")
      .regex(
        /[~!@#$%^&*()_+=-}{[\|';/.,<>?":}]/,
        "Password must contain at least one special character"
      ),
  });
  const response = userSchema.safeParse(body);
  if (response.success) {
    next();
  } else {
    res.status(400).json({ error: response.error.issues[0].message });
  }
};
const userCredentialsValidiation = (req, res, next) => {
  const body = req.body;
  const userSchema = zod.object({
    name: zod.string(),
    phone: zod.string(),
    email: zod.string().email(),
    password: zod
      .string()
      .min(8, "Password must be at least 8 character Long")
      .max(16, "Password cannot be more than 16 character long")
      .regex(/[A-Z]/, "Password must contain at least one upper case character")
      .regex(/[0-9]/, "Password must contain one number")
      .regex(
        /[~!@#$%^&*()_+=-}{[\|';/.,<>?":}]/,
        "Password must contain at least one special character"
      ),
  });
  const response = userSchema.safeParse(body);
  if (response.success) {
    next();
  } else {
    res.status(400).json({ error: response.error.issues[0].message });
    // res.status(400).json({ error: response });
  }
};

module.exports = { adminCredentialsValidiation, userCredentialsValidiation };
