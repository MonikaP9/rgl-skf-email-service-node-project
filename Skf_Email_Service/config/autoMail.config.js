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
      user: 'sunil.p@benchmarksolution.com',
      pass: 'sunil123#'
  }
    // auth: {
    //     user: 'ct.hmd@rob-log.com',
    //     pass: 'C3#tb5s@i9%r'
    // }
}
module.exports = autoEmailconfig;

