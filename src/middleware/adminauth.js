const jwt = require("jsonwebtoken")
require("dotenv").config()

exports.adminAuthenticate = (req, res, next) => {
    try {
        let token = req.headers["x-api-key"]
        if (!token) { return res.status(400).send({ status: false, msg: "invalid token" }) }

        let decodetoken = jwt.verify(token, process.env.Adminacesssecretkey)
        if (!decodetoken) {
            return res.status(400).send({ status: false, msg: "invalid token" })
        }
        req.userid = decodetoken.userid
        next()
    }
    catch (err) { return res.status(500).send({ status: false, msg: err.message }) }
}
exports.adminAuthorisation = async (req, res, next) => {

    try {
        let id = req.params.userid
        if (id == req.userid)
            req.userid = id
        next()
    }
    catch (err) {
        return res.status(400).send({ status: false, msg: err.message })
    }
}




