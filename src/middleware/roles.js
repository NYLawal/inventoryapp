const { AccessDeniedError } = require("./errors")

function admin(req,res,next){
    if (!req.user.isAdmin) throw new AccessDeniedError("Error: Access Denied!")
    next()
}

module.exports = {admin}
