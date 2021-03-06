const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { config } = require('process');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const RefreshToken = require('../models/refreshTokenModel');

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateJwtToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const randomTokenString = () => {
  return crypto.randomBytes(40).toString('hex');
};

const generateRefreshToken = (id, ip) => {
  // create a refresh token that expires in 7 days
  return new RefreshToken({
    user: id,
    token: randomTokenString(),
    expires: new Date(
      Date.now() + process.env.REFRESH_TOKEN_EXPIRES * 24 * 60 * 60 * 1000
    ),
    createdByIp: ip,
  });
};

const revokeRefreshToken = catchAsync(async (token, ip) => {
  // console.log(token);
  const refreshToken = await RefreshToken.findOne({ token });
  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ip;
  await refreshToken.save();
});

const createJwtAndCookieOptions = (user, req) => {
  const jwtToken = generateJwtToken(user._id);
  const jwtCookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  return { jwtToken, jwtCookieOptions };
};

const createRefreshAndCookieOptions = async (user, req) => {
  const refreshToken = generateRefreshToken(user._id, req.ip);
  await refreshToken.save();

  const refreshCookieOptions = {
    expires: new Date(
      Date.now() + process.env.REFRESH_TOKEN_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  return { refreshToken: refreshToken.token, refreshCookieOptions };
};

const createSendToken = async (user, statusCode, req, res) => {
  const { jwtToken, jwtCookieOptions } = createJwtAndCookieOptions(user, req);

  const {
    refreshToken,
    refreshCookieOptions,
  } = await createRefreshAndCookieOptions(user, req);

  res
    .cookie('jwtToken', jwtToken, jwtCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions);

  // Remove password froｍ output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    jwtToken,
    refreshToken: refreshToken,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // 1) create confirm Token
  const token = newUser.createConfirmToken();
  await newUser.save();
  // console.log(newUser);

  // 2) send email with token
  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/confirmEmail/${token}`;

    new Email(newUser, url).sendConfirm();

    res.status(200).json({
      status: 'success',
      message: 'Please confirm the email that we sent now.',
    });
  } catch (err) {
    newUser.confirmToken = undefined;
    newUser.confirmExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
  // Before
  // const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  // await new Email(newUser, url).sendWelcome();
  // createSendToken(newUser, 201, res);
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // console.log(hashedToken);

  const user = await User.findOne({
    confirmToken: hashedToken,
    confirmExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the active true
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.mailConfirm = true;
  user.confirmToken = undefined;
  user.confirmExpires = undefined;
  // console.log('before save');
  await user.save({ validateBeforeSave: false });
  // console.log('after save');

  // 3) send welcome mail ,log the user in, send JWT
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  // 4) Create tokens & send them as cookie
  const { jwtToken, jwtCookieOptions } = createJwtAndCookieOptions(user);

  const {
    refreshToken,
    refreshCookieOptions,
  } = await createRefreshAndCookieOptions(user, req);

  res
    .cookie('jwtToken', jwtToken, jwtCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions);

  // 5) redirect to top page
  res.redirect('/');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) Check if user exists && password is correct(1st authentication has succeeded)
  const user = await User.findOne({ email })
    .select('+password')
    .select('+mailConfirm');
  // const correct = await user.correctPassword(password, user.password);

  // console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // まだメール認証が終わってない場合
  if (!user.mailConfirm) {
    return next(new AppError('Please confirm your email', 401));
  }

  // ２段階認証（テストのため一旦コメントアウト）
  // // 3) Send SMS
  // const service = await client.verify.services.create({
  //   friendlyName: 'Natours Log in',
  // });
  // const serviceId = service.sid;
  // await User.findByIdAndUpdate(user._id, { serviceId });

  // // 本来は、userに登録された電話番号とカントリーコードから組み立てる
  // const phoneNumber = `${process.env.COUNTRY_CODE}${process.env.PHONE_NUMBER}`;
  // const verification = await client.verify
  //   .services(service.sid)
  //   .verifications.create({ to: phoneNumber, channel: 'sms' });
  // // channel: 'sms', 'call', 'emal'

  // console.log(verification.status);

  // // 4)
  // res.status(200).json({
  //   status: 'success',
  //   serviceId,
  //   message: 'Please confirm your phone that We are sending SMS message to',
  // });
  // ここまでが２段階認証部分

  // 以降、テストの為、２段階認証をスキップして、簡単にログインさせる
  // ) revoke used refreshToken
  // console.log(req.cookies);
  if (req.cookies.refreshToken) {
    await revokeRefreshToken(req.cookies.refreshToken, req.ip);
  }

  // ) If everyghing ok, create jwt and new refreshToken and send them to client
  await createSendToken(user, 200, req, res);
});

exports.confirmSMS = catchAsync(async (req, res, next) => {
  const { code, serviceId } = req.body;
  // 1) Get User from ServiceId
  const user = await User.findOne({ serviceId });

  // 2) Check if SMS code is correct
  // 本来は、userに登録された電話番号とカントリーコードから組み立てる
  const phoneNumber = `${process.env.COUNTRY_CODE}${process.env.PHONE_NUMBER}`;

  // console.log(serviceId);
  // console.log(phoneNumber);

  const verificationCheck = await client.verify
    .services(serviceId)
    .verificationChecks.create({ to: phoneNumber, code });

  // console.log(verificationCheck.status);

  // when input code is correct
  if (verificationCheck.status === 'approved') {
    // 3) ２段階認証が成功したので不要なserviceIdを消去
    await User.findByIdAndUpdate(user._id, { serviceId: undefined });

    // 4) revoke used refreshToken
    // console.log(req.cookies);
    if (req.cookies.refreshToken) {
      await revokeRefreshToken(req.cookies.refreshToken, req.ip);
    }

    // 5) If everyghing ok, create jwt and new refreshToken and send them to client
    await createSendToken(user, 200, req, res);
  }

  // when input code is incorrect
  if (verificationCheck.status === 'pending') {
    return next(
      new AppError('Your code is incorrect! Please confirm again', 401)
    );
  }
});

exports.logout = catchAsync(async (req, res) => {
  await revokeRefreshToken(req.cookies.refreshToken, req.ip);

  res
    .cookie('jwtToken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .cookie('refreshToken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let jwtToken;
  let currentUser;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    jwtToken = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwtToken) {
    jwtToken = req.cookies.jwtToken;
  }

  const { refreshToken } = req.cookies;

  if (!jwtToken && !refreshToken) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification jwtToken
  try {
    const decoded = await promisify(jwt.verify)(
      jwtToken,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }
  } catch (err) {
    // when jwtToken has expired
    const refreshTokenObj = await RefreshToken.findOne({ token: refreshToken });
    if (!refreshTokenObj || !refreshTokenObj.isActive) {
      // when refresh token is invalid
      return next(
        new AppError('Your refresh token has expired. Please log in again', 401)
      );
    }

    currentUser = await User.findById(refreshTokenObj.user);
    // create new jwtToken
    const {
      jwtToken: newJwtToken,
      jwtCookieOptions,
    } = createJwtAndCookieOptions(currentUser, req);

    // send new jwtToken as cookie
    res.cookie('jwtToken', newJwtToken, jwtCookieOptions);
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);

  let currentUser;
  try {
    // 1) Verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwtToken,
      process.env.JWT_SECRET
    );

    // 2) Check if user still exists
    currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 3) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // THERE IS A LOGGED IN USER
    res.locals.user = currentUser;
    req.user = currentUser;
    return next();
  } catch (err) {
    // when jwtToken has expired or isn't, but there is a refreshToken
    if (req.cookies.refreshToken) {
      const refreshTokenObj = await RefreshToken.findOne({
        token: req.cookies.refreshToken,
      });
      if (!refreshTokenObj || !refreshTokenObj.isActive) {
        // when refresh token is invalid
        return next();
      }
      currentUser = await User.findById(refreshTokenObj.user);
      // create new jwtToken
      const {
        jwtToken: newJwtToken,
        jwtCookieOptions,
      } = createJwtAndCookieOptions(currentUser, req);

      // send new jwtToken as cookie
      res.cookie('jwtToken', newJwtToken, jwtCookieOptions);

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    }

    next();
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide]. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perfom this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no use with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
