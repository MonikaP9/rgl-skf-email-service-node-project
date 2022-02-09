var config = require('../config/email.config');
var imaps = require('imap-simple');
var fs = require('fs');
var path = require('path');
var xlsx = require('node-xlsx').default;
var dbconfig = require('../config/db.config');
const sql = require('mssql');
const outboundColumn = require('../config/outboundColumn');
const inboundColumn = require('../config/inboundColumn');
var XLSX = require('xlsx');
const _ = require('lodash');
const simpleParser = require('mailparser').simpleParser;
//regex for emails extraction
function extractEmails(text) {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
}

//validate Date & convert
function convertDate(time) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(time - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    var mySqlDT = localISOTime;
    return mySqlDT;
}

//get email details
getEmail = new Promise((resolve, reject) => {
    // console.log("sdas");
    var conn = new sql.ConnectionPool(dbconfig);
    conn.connect()
        // Successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            //Execute Store procedure  
            req.execute('spGetEmailDetails', function(err, recordsets, returnValue) {
                // console.log(recordsets);
                resolve(recordsets['recordset'])
            });
        })
        // Handle connection errors
        .catch(function(err) {
            console.log(err);
            reject(err);
            conn.close();
        });
})

//promises
const loop = (arr, fn, busy, err, i = 0) => {
    const body = (ok, er) => {
        try {
            const r = fn(arr[i], i, arr);
            r && r.then ? r.then(ok).catch(er) : ok(r)
        } catch (e) {
            er(e)
        }
    }
    const next = (ok, er) => () => loop(arr, fn, ok, er, ++i)
    const run = (ok, er) => i < arr.length ? new Promise(body).then(next(ok, er)).catch(er) : ok()
    return busy ? run(busy, err) : new Promise(run)
}

//loggers
function sendLoggers(type, date, event, remark, seqNo) {
    console.log(event, date, remark);
    var conn = new sql.ConnectionPool(dbconfig);
    conn.connect()
        // Successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            //Execute Store procedure  
            req.input('EmailImportTypeID', type);
            req.input('EmailDate', date);
            req.input('Event', event);
            req.input('Remark', remark);
            req.input('SeqNo', seqNo);

            req.execute('spInsertEmailImportLog', function(err, recordsets, returnValue) {
                conn.close();
            });
        })
        // Handle connection errors
        .catch(function(err) {
            console.log(err);
            conn.close();
        });
}

//SO sp call
function spinsertInbound(sheet, date, seq) {
    return new Promise(function(resolve, reject) {
        var conn = new sql.ConnectionPool(dbconfig);
        conn.connect()
            // Successfull connection
            .then(() => {
                // Create request instance, passing in connection instance

                var req = new sql.Request(conn);
                var column = new sql.Table();
                // // Columns must correspond with type we have created in database.  

                inboundColumn.forEach(columnName => {
                    column.columns.add(columnName, sql.VarChar(100));
                })

                //    Add data into the table that will be pass into the procedure  
                for (var i = 1; i < sheet.length; i++) {
                    column.rows.add(
                        sheet[i][0], sheet[i][1], sheet[i][2], sheet[i][3], sheet[i][4], sheet[i][5],
                        sheet[i][6], sheet[i][7], sheet[i][8], sheet[i][9], sheet[i][10], sheet[i][11],
                        sheet[i][12], sheet[i][13], sheet[i][14], sheet[i][15], sheet[i][16], sheet[i][17],
                        sheet[i][18], sheet[i][19], sheet[i][20], sheet[i][21], sheet[i][22]
                    )
                }

                console.log('====================================');
                //    console.log(column);
                //  console.log(column.columns);
                console.log("row =====================");
                //   console.log(column.rows);
                console.log(column.rows.length);

                console.log('====================================');
                console.log("sp sales order call " + date + seq);
                req.input('udtEmailImportInBound', column);
                req.input('EmailDate', date);
                req.input('FieldValues', sheet[1]);
                req.input('SeqNo', seq);
                //Execute Store procedure  
                req.execute('spInsertEmailImportInBound', async function(err, recordsets, returnValue) {
                    console.log(recordsets)
                    if (err) {
                        console.log('spInsertEmailImportInBound error : ', err);
                        sendLoggers(1, date, "inbound sp error", err)
                    } else {
                        sendLoggers(1, date, "sp successful", "inbound data inserted")
                        resolve(recordsets)
                    }
                })
            })
            // Handle connection errors
            .catch(function(err) {
                console.log(err);
                conn.close();
                reject(err)
            });

    })
}

function spinsertOutbound(sheet, date, seq) {
    return new Promise(function(resolve, reject) {
        var conn = new sql.ConnectionPool(dbconfig);
        conn.connect()
            // Successfull connection
            .then(() => {
                // Create request instance, passing in connection instance

                var req = new sql.Request(conn);
                var column = new sql.Table();
                // // Columns must correspond with type we have created in database.  

                outboundColumn.forEach(columnName => {
                    column.columns.add(columnName, (columnName == 'HHADR1' ||
                        columnName == 'HHADR2' || columnName == 'HHADR3' || columnName == 'HHADR4') ? sql.NVarChar(500) : sql.VarChar(100));
                })

                //    Add data into the table that will be pass into the procedure  
                for (var i = 1; i < sheet.length; i++) {
                    column.rows.add(
                        sheet[i][0], sheet[i][1], sheet[i][2], sheet[i][3], sheet[i][4], sheet[i][5],
                        sheet[i][6], sheet[i][7], sheet[i][8], sheet[i][9], sheet[i][10], sheet[i][11],
                        sheet[i][12], sheet[i][13], sheet[i][14], sheet[i][15], sheet[i][16], sheet[i][17],
                        sheet[i][18], sheet[i][19], sheet[i][20], sheet[i][21], sheet[i][22], sheet[i][23],
                        sheet[i][24], sheet[i][25], sheet[i][26], sheet[i][27], sheet[i][28], sheet[i][29],
                    )
                }
                // console.log(column.rows[0]);
                console.log('====================================');
                //  console.log(column.columns);
                //  console.log(column);

                console.log(column.rows.length);

                console.log('====================================');
                console.log("sp sales order call " + date + seq);
                req.input('udtEmailImportOutBound', column);
                req.input('EmailDate', date);
                req.input('FieldValues', sheet[1]);
                req.input('SeqNo', seq);
                //Execute Store procedure  
                req.execute('spInsertEmailImportOutBound', async function(err, recordsets, returnValue) {
                    // console.log(recordsets)
                    if (err) {
                        console.log('spInsertEmailImportOutBound error : ', err);
                        sendLoggers(2, date, "outbound sp error", err)
                    } else {
                        sendLoggers(2, date, "sp successful", "outbound data inserted")
                        resolve(recordsets)
                    }
                })
            })
            // Handle connection errors
            .catch(function(err) {
                console.log(err);
                conn.close();
                reject(err)
            });

    })
}

//count update if message get deleted for so,cc and handover..................
function spUpdateEmailSeqNo(typeId, seqNo) {
    return new Promise(function(resolve, reject) {
        var conn = new sql.ConnectionPool(dbconfig);
        conn.connect()
            // Successfull connection
            .then(() => {
                // Create request instance, passing in connection instance
                var req = new sql.Request(conn);
                req.input('FileTypeID', typeId);
                req.input('SeqNo', seqNo);
                //Execute Store procedure  
                req.execute('spUpdateEmailSeqNo', async function(err, recordsets, returnValue) {
                    // console.log(recordsets)
                    if (err) {
                        console.log('error log :', err);
                    }
                    var datecurrent = new Date()
                    sendLoggers(0, convertDate(datecurrent), "seq no update sp successful", "data inserted")
                    resolve(recordsets)
                })
            })
            // Handle connection errors
            .catch(function(err) {
                console.log(err);
                conn.close();
                reject(err)
            });

    })
}


//for email fetch.............................................................
exports.extractEmailAttachment = function(req, res) {
    // console.log(successMessage);
    var conn = new sql.ConnectionPool(dbconfig);
    conn.connect()
        // Successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            var msgFor = '';
            //Execute Store procedure  
            req.execute('spGetEmailDetails', function(err, recordsets, returnValue) {
                //    console.log('spGetEmailDetails', recordsets);
                var totalMessageCount;
                var isDeleted = false;
                imaps.connect(config).then(function(connection) {
                    connection.openBox('INBOX').then((mes) => {
                        console.log("mail read started");
                        //  console.log('recordsets: ', recordsets);
                        //get all message count.......................
                        totalMessageCount = mes['messages']['total'];
                        console.log('total message count: ', totalMessageCount);
                        //check total count and our table count is same or not if less then message get deleted....
                        if (totalMessageCount < recordsets['recordset'][0].InBoundSeqNo) {
                            isDeleted = true;
                            //sp call to change count for so................
                            spUpdateEmailSeqNo(1, totalMessageCount);
                        }

                        searchCriteria = [
                            "4810"
                            // `${isDeleted ? (totalMessageCount+1) : (recordsets['recordset'][0].InBoundSeqNo+1)}:${isDeleted ? (totalMessageCount+20) : (recordsets['recordset'][0].InBoundSeqNo+20)}`
                        ];

                        var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true }

                        return connection.search(searchCriteria, fetchOptions)
                    }).then(function(messages) {
                        var datecurrent = new Date()
                        sendLoggers(0, convertDate(datecurrent), "Process Start", "")
                        console.log("mail count : ", messages.length);
                        var attachments = [];
                        var msgFrom = '';
                        if (messages.length == 0) {
                            var datecurrent = new Date()
                            sendLoggers(0, convertDate(datecurrent), "no mails found", "")
                        } else {
                            sendLoggers(1, convertDate(messages[messages.length - 1].attributes.date), "inbound sequence Number ", "", messages[messages.length - 1].seqNo)
                            sendLoggers(2, convertDate(messages[messages.length - 1].attributes.date), "outbound sequence Number ", "", messages[messages.length - 1].seqNo)
                            messages.forEach(function(message) {
                                var from = extractEmails(message.parts[0].body.from[0])
                                console.log(message.parts[0].body.subject[0]);
                                console.log(recordsets['recordset'][0].InBoundFromEmail.split(','));
                                var skfEmailList = message != null && message.parts[0].body.subject[0].toLowerCase() === 'inbound' ? recordsets['recordset'][0].InBoundFromEmail.split(',') : recordsets['recordset'][0].OutBoundFromEmail.split(',');
                                if (skfEmailList.includes(from[0])) {
                                    console.log(message.parts[0].body.subject[0]);
                                    if (message.parts[0].body.subject[0].toLowerCase() === 'inbound') {
                                        console.log('inbound executed...........................................');
                                        sendLoggers(1, convertDate(messages[messages.length - 1].attributes.date), "inbound mails found with sequence Number ", "", messages[messages.length - 1].seqNo)
                                        var parts = imaps.getParts(message.attributes.struct);
                                        msgFor = 'inbound';
                                        attachments = attachments.concat(parts.filter(function(part) {
                                            return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                                        }).map(function(part) {
                                            return connection.getPartData(message, part)
                                                .then(function(partData) {
                                                    return {
                                                        seqNo: message.seqNo,
                                                        emailDetails: recordsets['recordset'][0],
                                                        // emailDetails: ['sunil.p@benchmarksolution.com'],
                                                        from: from,
                                                        date: message.attributes.date,
                                                        filename: part.disposition.params.filename,
                                                        data: partData
                                                    };
                                                });
                                        }));
                                    } else if (message.parts[0].body.subject[0].toLowerCase() === 'outbound') {
                                        console.log('outbound executed...................................');
                                        sendLoggers(2, convertDate(messages[messages.length - 1].attributes.date), "outbound mails found with sequence Number", "", messages[messages.length - 1].seqNo)
                                        var parts = imaps.getParts(message.attributes.struct);
                                        msgFor = 'outbound';
                                        attachments = attachments.concat(parts.filter(function(part) {
                                            return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                                        }).map(function(part) {
                                            return connection.getPartData(message, part)
                                                .then(function(partData) {
                                                    return {
                                                        seqNo: message.seqNo,
                                                        emailDetails: recordsets['recordset'][0],
                                                        // emailDetails: ['sunil.p@benchmarksolution.com'],
                                                        from: from,
                                                        date: message.attributes.date,
                                                        filename: part.disposition.params.filename,
                                                        data: partData
                                                    };
                                                });
                                        }));
                                    }
                                }
                            });
                        }
                        return Promise.all(attachments);
                        // return Promise.all(attachments);
                        // successMessage = ""
                    }).then((attachments) => {
                        // var attachments = list[0];
                        var msgFrom = msgFor;
                        // var msgFrom = 'outbound';
                        let promises = [];
                        var datecurrent = new Date()
                        console.log(`Attachments:${attachments.length} email date:`)
                            // console.log(attachments)
                        if (attachments.length == 0) {
                            sendLoggers(0, convertDate(datecurrent), "no attachment found", "")
                            console.log(`Attachments:${attachments.length} email date:`);
                            // res.send(`Attachments:${attachments.length} email date:`)
                            connection.end()
                        } else {
                            attachments.forEach(attach => {
                                sendLoggers(msgFrom === 'inbound' ? 1 : 2, convertDate(attach.date), msgFrom === 'inbound' ? "attachment found for inbound" : "attachment found for outbound", "")
                                var arraybuffer = attach.data;
                                /* convert data to binary string */
                                var data = new Uint8Array(arraybuffer);
                                var arr = new Array();
                                for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                                var bstr = arr.join("");
                                try {
                                    const workSheetsFromBuffer = xlsx.parse(attach.data);
                                    workSheetsFromBuffer.forEach(workbook => {
                                        promises.push({
                                            'sheet': workbook.data,
                                            'date': convertDate(attach.date),
                                            'seq': attach.seqNo
                                        })
                                    });
                                } catch (err) {
                                    console.log(err);
                                }

                            });
                        }
                        return Promise.all([promises, msgFrom]);

                    }).then((data) => {
                        var abc = data[0];
                        var msgFrom = data[1];
                        console.log(abc.length);
                        abc.forEach((element, i) => {
                            setTimeout(() => {
                                console.log('insert doc : ', element.seq);
                                // console.log('insert doc file: ',element.sheet);
                                // console.log('insert doc file single data1 : ',element.sheet[1][1]);
                                // console.log('insert doc file single data2 : ',element.sheet[1][2]);
                                if (msgFrom === 'inbound') {
                                    spinsertInbound(element.sheet, element.date, element.seq)
                                } else if (msgFrom === 'outbound') {
                                    spinsertOutbound(element.sheet, element.date, element.seq)
                                }

                                console.log(element.date, element.seq)
                            }, i * 1000);

                        });
                        res.setTimeout(20000, function() {
                            var datecurrent = new Date()
                            sendLoggers(0, convertDate(datecurrent), "process ended", "")
                            console.log("Success");
                        })
                    })

                })

            });



        })
        // Handle connection errors
        .catch(function(err) {
            console.log(err);
            conn.close();
        });

    // printy()

}

exports.parseXl = function(req, res) {
    var workbook = XLSX.readFile('abc.xlsb');
    var sheet_name_list = workbook.SheetNames;
    res.send(sheet_name_list)
}