import User from "../models/user.schema";
import asyncHandler from "../service/asyncHandler";
import CustomError from "../utils/customError";
import mailHelper from "../utils/mailHelper";

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

/***************************************************************
@FORGOT_PASSWORD
@route http://localhost:4000/api/auth/password/forgot 
@description User will submit email and we will generate a token
@parameters email
@return email sent
***************************************************************/

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // check email validation

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const resetToken = user.generateForgotPasswordToken();

  // if we just do user.save() it will fire all the validations but if we just want to save then do the below
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}`;

  const text = `Your password reset url is 
  \n\n ${resetUrl} \n\n
  `;

  try {
    await mailHelper({
      email: user.email,
      subject: "Password reset email for website",
      text: text,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    // even though email failed to sent still the database fields like forgotPasswordToken and time got populated, thus we need to clear those fields
    // roll back - clear fields and save
    user.forgotPasswordToken = undefiled;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new CustomError(err.message || "Email sent failure", 500);
  }
});
