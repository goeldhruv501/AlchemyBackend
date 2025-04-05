const { errorhandling } = require("../Errorhandling/errorhandling.js")
const jwt = require("jsonwebtoken")
const shopkeepmodel = require("../model/Usermodel.js")
const bcrypt = require("bcrypt")
const { CreateURL } = require('../ImageUploader/ImageURL.js')
const { OTPSender } = require('../NodeMailer/MailSender.js')
const userModel = require("../model/Usermodel.js")
require("dotenv").config()

exports.Createshopkeeper = async (req, res) => {
    try {

        const ImageData = req.file;
        const data = req.body;
        const { name, userName, password } = data;

        let randomOtp = Math.floor(1000 + Math.random() * 9000);

        const checkUserName = await userModel.findOne({ userName: userName })

        if (checkUserName) {

            if (!(checkUserName.isActive)) return res.status(400).send({ status: true, msg: "Account is Block" })
            if (checkUserName.isOTPVerified) return res.status(400).send({ status: true, msg: "Account is Already Active Pls LogIn" })
            OTPSender(userName, name, randomOtp)

            await userModel.findOneAndUpdate({ userName: userName }, { $set: { OtpVerification: randomOtp } })

            return res.status(200).send({ status: true, msg: "Successfully send Otp", data: { id: checkUserName._id, userName: checkUserName.userName, } })
        }

        const bcryptPassword = await bcrypt.hash(password, 10);
        data.password = bcryptPassword;
        data.OtpVerification = randomOtp;
        data.role = 'shopkeeper';


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
            name: createData.name,
            password: createData.password
        }

        return res.status(201).send({ status: true, msg: "User Data Created successfully!", data: newobj })
    }
    catch (err) { return res.status(500).send({ status: false, msg: err.message }) }
}



exports.GetShopkkperData = async (req, res) => {
    try {
        const id = req.params.ShopkeeperId

        if(!id) return res.status(400).send({ status: false, msg: "plz provide ShopkeeperId" })

        const data = await userModel.findById(req.params.ShopkeeperId).select({ profileImg: 1, name: 1, shopkeeperdescription: 1 })

        return res.status(200).send({ status: true, data: data })

    }
    catch (err) { return errorhandling(err, res) }
}

exports.Loginshopkeeper = async (req, res) => {
    try {
        const data = req.body
        const { userName, password } = data
        if (!userName) { return res.status(400).send({ status: false, msg: "plz provide username" }) }
        if (!password) { return res.status(400).send({ status: false, msg: "plz provide password" }) }

        const checkMailId = await shopkeepmodel.findOne({ userName: userName })

        if (!checkMailId) { return res.status(404).send({ status: false, msg: "plz SignUp Account First" }) }
        if (checkMailId) {
            if (!checkMailId.isOTPVerified) return res.status(400).send({ status: false, msg: "Otp Verification Pending", id: checkMailId._id })
            if (checkMailId.isdeleted) return res.status(400).send({ status: false, msg: "Your Account is Deleted" })
            if (!checkMailId.isOTPVerified) return res.status(400).send({ status: false, msg: "Otp Verification Pending", id: checkMailId._id })

            let checkpass = await bcrypt.compare(password.trim(), checkMailId.password)
            if (!checkpass) return res.status(400).send({ Staus: false, msg: "Wrong Password", data: checkpass })

            let id = checkMailId._id
 
            let token = jwt.sign({
                UserId: id,
                AuthorName: 'Tarun'
            },
                process.env.AshopkeeperAcessSecretkey,
                { expiresIn: '12h' }
            )

            return res.status(200).send({ status: true, token, id, profileImg: checkMailId.profileImg })

        }

    }
    catch (err) { return errorhandling(err, res) }
}