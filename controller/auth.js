const { validationResult } = require("express-validator");

exports.send_otp = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throwError({
      message: "Validation Failed",
      statusCode: 422,
      data: errors.array(),
    });
  }

  const phoneNumber = req.body.phone_number;
  console.log(phoneNumber);
};
