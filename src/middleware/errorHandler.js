const ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Handling");
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg.includes("E11000") ? 'duplicate value': errMsg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
}
    
    process.on('uncaughtException', err =>{
        console.log(`something happened: ${err}`);
        process.exit(1);
    })
    
    module.exports = ErrorHandler