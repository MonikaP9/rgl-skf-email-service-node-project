const autoEmailconfig = {
  host: 'smtp.gmail.com',
  // host: 'smtp.robinsonsglobal.com',
    port: 587,
    tls: {
      ciphers:'SSLv3'
   },
    secureConnection: false,
    // secure: true, // use SSL
    auth: {
      user: 'sunilbench030@gmail.com',
      pass: 'gligcyuuqwvdkbvm'
  }
    // auth: {
    //     user: 'ct.skf@rob-log.com',
    //     pass: 'C3#tb5s@i9%r'
    // }
}
module.exports = autoEmailconfig;

