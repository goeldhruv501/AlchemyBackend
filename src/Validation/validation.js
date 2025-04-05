exports.ValidName = (name) => {
    const fnameRegex = /^([a-z A-Z])+$/;
    return fnameRegex.test(name);
}

exports.ValidUserName = (userName) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(userName);
}

exports.ValidPassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
}

exports.ValidMobileNo = (mobileNo) => {
    const mobileNoRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
    return mobileNoRegex.test(mobileNo);
}