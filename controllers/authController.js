import User from "../models/user.schema";
import asyncHandler from "../service/asyncHandler";
import CustomError from "../utils/customError";

export const cookieOption = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

/***************************************************************
@SIGNUP
@route http://localhost:4000/api/auth/signup 
@description User signup controller for creating a new user 
@parameters name, email, password
@return User Object
***************************************************************/

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new CustomError("Please fill all fields", 400); // throws an error and code moves to the catch block
  }

  // check if the user exists in DB
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  }); // here we are returned with the document created tus we get the password back but next time when we will query the document we will not get the password because of select: false

  const token = user.getJwtToken();
  console.log(user);
  user.password = undefined;

  res.cookie("token", token, cookieOption);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});
