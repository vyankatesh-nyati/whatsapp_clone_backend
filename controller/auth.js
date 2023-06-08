const { validationResult } = require("express-validator");

const { PublishCommand, SNSClient } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

function generateOTP() {
  let otp = "";
  for (let i = 0; i < 5; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

exports.send_otp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const phoneNumber = req.body.phone_number;
    const otp = generateOTP();

    const command = new PublishCommand({
      Message: `Your OTP for mobile number verification for WhatsApp Clone is ${otp}`,
      PhoneNumber: phoneNumber,
    });
    const response = await snsClient.send(command);

    res.status(200).json({
      message: "Otp sent successfully",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
