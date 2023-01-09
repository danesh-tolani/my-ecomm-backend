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

/***************************************************************
@LOGIN
@route http://localhost:4000/api/auth/login 
@description User signIn controller for loging in a user 
@parameters email, password
@return User Object
***************************************************************/
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError("Please fill all fields", 400);
  }

  const user = User.findOne({ email }).select("+password"); // while querying the document it selects te password field as well

  if (!user) {
    throw new CustomError("Invalid credentials", 400);
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (isPasswordMatched) {
    const token = user.getJwtToken();
    user.password = undefined;
    res.cookie("token", token, cookieOption);
    return res.status(200).json({
      success: true,
      token,
      user,
    });
  }
  throw new CustomError("Invalid credentials - password", 400);
});

/***************************************************************
@LOGOUT
@route http://localhost:4000/api/auth/logout 
@description User logout by clearing user cookies
@parameters 
@return success message
***************************************************************/
// _req means we are not using req anywhere
export const logout = asyncHandler(async (_req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});
