const { errorhandling } = require('../Errorhandling/errorhandling.js')
const userModel = require('../model/Usermodel.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { CreateURL } = require('../ImageUploader/ImageURL.js')
const { OTPSender } = require('../NodeMailer/MailSender.js')
require('dotenv').config()


exports.createuser = async (req, res) => {

    try {
        
        const ImageData = req.file;
        const data = req.body;

        const { name, userName, password } = data;
        
        let randomOtp = Math.floor(1000 + Math.random() * 9000);
        
        
        const checkUserName = await userModel.findOne({ userName: userName })
        
        
        if (checkUserName) {
           
            if(!(checkUserName.isActive)) return res.status(400).send({ status: true, msg: "Account is Block" })
            if(checkUserName.isOTPVerified) return res.status(400).send({ status: true, msg: "Account is Already Active Pls LogIn" })
            OTPSender(userName, name, randomOtp)

            await userModel.findOneAndUpdate({ userName: userName }, { $set: { OtpVerification: randomOtp } })
 
            return res.status(200).send({ status: true, msg: "Successfully send Otp", data: {id:checkUserName._id,userName: checkUserName.userName,} })
        }

        const bcryptPassword = await bcrypt.hash(password, 10);
        data.password = bcryptPassword;
        data.OtpVerification = randomOtp;
        data.role = 'user';
        
        
        if (ImageData) {
            const URL = await CreateURL(ImageData.path)
            data.profileImg = URL;
        }
        OTPSender(userName, name, randomOtp)
        const createData = await userModel.create(data);

        const newobj = {
            id: createData._id, 
            profileImg: createData.profileImg, 
            userName: createData.userName,
            name:createData.name,
            password:createData.password
        }

        return res.status(201).send({ status: true, message: "User Data Created successfully!",data:newobj  })
    }
    catch (err) {return res.status(500).send({ status: false, msg: err.message }) }
}
exports.OtpVerification = async (req, res) => {
    try {
      const { otp } = req.body;
      const { userId } = req.params;
  
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, msg: 'User not found. Please register first.' });
      }
  
      if (user.OtpVerification !== otp) {
        return res.status(400).json({ success: false, msg: 'Incorrect OTP.' });
      }
      
      
      user.isOTPVerified = true;
      await user.save();
  
      return res.status(200).json({ success: true, msg: 'OTP successfully verified. Please log in.' });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message });
    }
  };


  exports.Resendotp = async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(userId)
      let randomOtp = Math.floor(1000 + Math.random() * 9000);

     const Finduser = await userModel.findByIdAndUpdate({_id:userId},{$set:{OtpVerification:randomOtp}},{new:true})

     if(!Finduser) return res.status(400).send({status:false,msg:"user not found"})
  
      return res.status(200).json({ success: true, msg: 'OTP successfully send.' });
    } catch (err) {
      return res.status(500).json({ success: false, msg: 'Internal server error.' });
    }
  };
  
exports.getApI = async (req, res) => {
    try {

        const data = await userModel.find({ isdeleted: false })
            .sort({ _id: -1 }).select({ _id: 1, name: 1, email: 1, password: 1 })

        return res.send({ status: true, msg: "Get All the data", Data: data })
    }

    catch (e) {
        return res.status(500).send({ status: false, msg: e.message })

    }
}

exports.LogInUser = async (req, res) => {
    try {

        const data = req.body;
        const { userName, password } = data
        if (!userName) { return res.status(400).send({ status: false, msg: "plz provide username" }) }
        if (!password) { return res.status(400).send({ status: false, msg: "plz provide password" }) }


        const checkMailId = await userModel.findOne({ userName: userName, isOTPVerified: true })
        if (!checkMailId) { return res.status(404).send({ status: false, msg: "plz login or Verify Otp" }) }
        let checkpass = await bcrypt.compare(password.trim(), checkMailId.password)
        if (!checkpass) return res.status(400).send({ Staus: false, msg: "Wrong Password", data: checkpass })

        let id = checkMailId._id

        let token = jwt.sign({
            UserId: id,
            AuthorName: 'Tarun'
        },
            process.env.AcessSecretKey,
            { expiresIn: '12h' }
        )

        return res.status(200).send({ status: true, token, id, profileImg: checkMailId.profileImg })

    }
    catch (err) { return errorhandling(err, res) }
}


exports.updateApi = async (req, res) => {
    try {
        let data = req.body
        const updatedata = await userModel.findOneAndUpdate({
            _id: req.UserId

        }, { $set: { name: data.name } }, { new: true }
        )
        return res.status(200).send({ status: true, msg: "data updated sucessfully", data: updatedata })

    }
    catch (err) { return errorhandling(err, res) }
}


exports.deleteApi = async (req, res) => {
    try {
        let id = req.params.userid
        const deletedUser = await userModel.findOneAndUpdate(

            { _id: id },
            { $set: { isdeleted: true } },
            { new: true }

        )

        return res.status(200).send({ status: true, msg: "Delete Api Created", data: deletedUser })
    }
    catch (err) { return errorhandling(err, res) }

}


