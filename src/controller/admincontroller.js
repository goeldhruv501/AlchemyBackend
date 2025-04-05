const { errorhandling } = require('../Errorhandling/errorhandling.js')
const adminmodel = require('../model/Usermodel.js')
const bcrypt = require('bcrypt')
const Usermodel = require("../model/Usermodel.js")
const jwt = require('jsonwebtoken')
require('dotenv').config()



exports.creatadmin = async (req, res) => {
    try {
        console.log('bhbjk')
        const data = req.body;

        if (data.password == undefined) { return res.status(400).send({ status: false, message: "provide password first!" }) }

        const passbcrypt = await bcrypt.hash(data.password, 5)
        data.password = passbcrypt
        const createdata = await adminmodel.create(data);
        return res.status(201).send({ status: true, message: "user data created sucessfully!", data: createdata })


    }
    catch (err) { return errorhandling(err, res) }

}
exports.getApI = async (req, res) => {
    try {

        const data = await Usermodel.find({ isdeleted: false })
            .sort({ _id: -1 }).select({ _id: 1, name: 1, userName: 1, password: 1, })

        return res.send({ status: true, msg: "Get All the data", Data: data })
    }

    catch (e) {
        return res.status(500).send({ status: false, msg: e.message })

    }
}
exports.Loginadmin = async (req, res) => {
    try {
        const data = req.body;
        const { userName, password } = data
        if (!userName) { return res.status(400).send({ status: false, msg: "plz provide username" }) }
        if (!password) { return res.status(400).send({ status: false, msg: "plz provide password" }) }


        const checkMailId = await adminmodel.findOne({ userName: userName })
        if (!checkMailId) { return res.status(404).send({ status: false, msg: "plz login" }) }

        let checkpass = await bcrypt.compare(password.trim(), checkMailId.password)
        if (!checkpass) return res.status(400).send({ Staus: false, msg: "Wrong Password", data: checkpass })

        let id = checkMailId._id

        let token = jwt.sign({
            UserId: id,
            AuthorName: 'Tarun'
        },
            process.env.Adminacesssecretkey,
            { expiresIn: '12h' }
        )

        return res.status(200).send({ status: true, token, id, profileImg: checkMailId.profileImg })

    }
    catch (err) { return errorhandling(err, res) }
}

exports.deleteuserapi = async (req, res) => {
    try {
        let id = req.params.userid
        const deleteduser = await Usermodel.findOneAndUpdate(
            { _id: id },

            { $set: { isdeleted: true } },
            {
                new: true
            }
        )
        return res.status(200).send({ Status: true, data: deleteduser })
    }
    catch (err) { return errorhandling(err, res) }
}







