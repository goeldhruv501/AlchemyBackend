const { ValidName, ValidPassword, ValidUserName, ValidMobileNo } = require("../Validation/validation.js");



exports.Validation = async (req, res, next) => {
    try {

        const data = req.body;

        const { name, userName, password, mobileNo } = data;

        if(!name) {return res.status(400).send({status:false,msg:"Name is Required"})}
        if(!ValidName(name)) {return res.status(400).send({status:false,msg:"Invalid Name"})}

        if(!userName) {return res.status(400).send({status:false,msg:"UserName is Required"})}
        if(!ValidUserName(userName)) {return res.status(400).send({status:false,msg:"Invalid UserName"})}

        if(!password) {return res.status(400).send({status:false,msg:"Password is Required"})}
        if(!ValidPassword(password)) {return res.status(400).send({status:false,msg:"Invalid Password"})}

        if(!mobileNo) {return res.status(400).send({status:false,msg:"mobileNo is Required"})}
        if(!ValidMobileNo(mobileNo)) {return res.status(400).send({status:false,msg:"Invalid mobileNo"})}

        next()
    }
    catch (e) { return }

}