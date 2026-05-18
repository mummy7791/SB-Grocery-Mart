import Admin from "../models/Admin.js";

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username, password });

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    success: true,
    admin
  });
};


