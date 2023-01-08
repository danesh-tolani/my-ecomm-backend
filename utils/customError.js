class CustomError extends Error {
  constructor(message, code) {
    super(message); // message is comming from Error class
    this.code = code;
  }
}

export default CustomError;
