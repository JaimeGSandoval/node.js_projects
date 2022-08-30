const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

const filterObj = (reqBody, ...allowedFields) => {
  const newObj = {};
  Object.keys(reqBody).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = reqBody[key];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

// updates current authenticated user
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Filter out unwanted fields names that are not allowed to be updated in this route
  // Since we're not dealing with sensitive data and do not need to use save(). We can use findByIdaAndUpdate()
  // you never pass in req.body as the value for the data being changed. It could have other data in it such as resetPassword, change role, or other sensitive fields and would allow them to be changed. Instead, you create an object the contains the name or email gathered from req.body
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) update document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
