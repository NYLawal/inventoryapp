 class NotFoundError extends Error {
    constructor(message){
      super(message)
      this.status = 404;
      this.errorType = "NotFoundError";
    }
  }
  
 class BadUserRequestError extends Error {
    constructor(message){
      super(message)
      this.status = 400;
      this.errorType = "BadUserRequestError";
    }
  }

 class UnAuthorizedError extends Error {
    constructor(message){
      super(message)
      this.status = 401;
      this.errorType = "UnAuthorizedError";
    }
  }
  
 class MailNotSentError extends Error {
    constructor(message){
      super(message)
      this.status = 401;
      this.errorType = "MailNotSentError";
    }
  }
  
 class AccessDeniedError extends Error {
    constructor(message){
      super(message)
      this.status = 403;
      this.errorType = "AccessDeniedError";
    }
  }

  class ValidationError extends Error {
    constructor(message) {
      super(`Validation failed: ${message}`);
      this.status = 400;
      this.errorType = 'ValidationError';
    }
  }
 

  module.exports = { AccessDeniedError, MailNotSentError, ValidationError, UnAuthorizedError, BadUserRequestError, NotFoundError }
  
  