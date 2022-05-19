const config = {
//   imap: {
//     user: 'ct.hmd@rob-log.com',
//     password: 'C3#tb5s@i9%r',
//     host: 'pop.robinsonsglobal.com',
//     port: 993,
//     tls: true,
//     authTimeout: 3000
// }
imap: {
  user: 'sunil.p@benchmarksolution.com',
  password: 'sunil123#',
  host: 'pop.gmail.com',
  port: 993,
  tls: true,
  authTimeout: 3000,
  tlsOptions: { rejectUnauthorized: false }
}

// imap: {
//   user: 'sunilbench030@gmail.com',
//   password: 'Sunil123#',
//   host: 'pop.gmail.com',
//   port: 993,
//   tls: true,
//   authTimeout: 3000,
//   tlsOptions: { rejectUnauthorized: false }
// }

}
module.exports = config;

