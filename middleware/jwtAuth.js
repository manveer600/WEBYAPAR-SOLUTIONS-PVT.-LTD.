const JWT = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  // check kr ki bhai token exist krta bhi h k nhi 
  const token = (req.cookies && req.cookies.token) || null;

  if (!token) {
    return res.status(400).json({ success: false, message: "NOT authorized" });
  }


  try {
    const payload = JWT.verify(token, process.env.SECRET);
    // console.log(payload);
    // console.log(user);
    // req.user = { id: payload.id, email: payload.email };
    req.user = payload;
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
};





module.exports = isLoggedIn;