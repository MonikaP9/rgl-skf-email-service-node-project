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
const { split, join } = require('lodash');
var LocalStorage = require('node-localstorage').LocalStorage
var localStorage = new LocalStorage('./scratch');
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
function spColumnUdt(emailColumnName, sheetRowData, emailFrom, emailSubject, emailFileName, seqNo, docNo) {
    return new Promise(function(resolve, reject) {
        var conn = new sql.ConnectionPool(dbconfig);
        conn.connect()
            // Successfull connection
            .then(() => {
                // Create request instance, passing in connection instance
                var datecurrent = new Date()
                sendLoggers(0, convertDate(datecurrent), "insert process started for seqNo " + seqNo + "and doc no " + docNo, "subject - " + emailSubject[0] + " file name - " + emailFileName[0])

                var req = new sql.Request(conn);
                var column = new sql.Table();
                console.log("emailFrom  :", emailFrom[0]);
                console.log("emailSubject  :", emailSubject[0]);

                req.input('fromClause', sql.VarChar(100), emailFrom[0]);
                req.input('Subject', sql.VarChar(200), emailSubject[0]);


                // For single file columns name
                var columnsData = [];
                for (var n = 0; n < emailColumnName[0].length; n++) {
                    columnsData[n] = emailColumnName[0][n];
                }

                console.log("columnsData[n]  :" + columnsData);
                columnsData.forEach(columnName => {
                    column.columns.add(columnName, sql.VarChar(100));
                })

                var stringData = JSON.stringify(columnsData.toString());

                req.input('UDTColumns', sql.VarChar(1000), stringData.split('"').join(''));
                sendLoggers(0, convertDate(datecurrent), "column prepared success for sp spGetImportColumnNames", "subject - " + emailSubject[0] + " file name - " + emailFileName[0])
                var udtName;
                // Send column names to sp
                console.log("spGetImportColumnNames call");
                req.execute('spGetImportColumnNames', function(err, recordsets, returnValue) {
                    console.log(recordsets);
                    console.log(recordsets['recordset'][0]['UDTName']);

                    udtName = recordsets['recordset'][0]['UDTName'];
                    console.log(udtName);
                    if (err) {
                        console.log('spGetImportColumnName error : ', err);
                        console.log("err " + err);

                        sendLoggers(0, "spGetImportColumnNames error", emailFileName[0], err);
                    } else {

                        sendLoggers(0, convertDate(datecurrent), "spGetImportColumnNames called successful with udtname as " + udtName, "subject - " + emailSubject[0] + " file name - " + emailFileName[0])
                        //============================
                        //To send row data
                        if (udtName != null) {
                            var spName = '';
                            //console.log("sheetRowData : -" + sheetRowData[1][1]);
                            console.log('row data length : ', sheetRowData[0].length);
                            for (var n = 1; n < sheetRowData[0].length; n++) {
                                if (udtName.trim() == 'udtEmailImportInBound') {
                                    spName = 'spInsertEmailImportInBound';
                                    column.rows.add(
                                        sheetRowData[0][n][0], sheetRowData[0][n][1], sheetRowData[0][n][2], sheetRowData[0][n][3], sheetRowData[0][n][4], sheetRowData[0][n][5],
                                        sheetRowData[0][n][6], sheetRowData[0][n][7], sheetRowData[0][n][8], sheetRowData[0][n][9], sheetRowData[0][n][10], sheetRowData[0][n][11],
                                        sheetRowData[0][n][12], sheetRowData[0][n][13], sheetRowData[0][n][14], sheetRowData[0][n][15], sheetRowData[0][n][16],
                                        sheetRowData[0][n][17], sheetRowData[0][n][18], sheetRowData[0][n][19], sheetRowData[0][n][20], sheetRowData[0][n][21], sheetRowData[0][n][22]
                                    );
                                }else if (udtName.trim() == 'udtEmailImportOutBound') {
                                    spName = 'spInsertEmailImportOutBound';
                                    column.rows.add(
                                        sheetRowData[0][n][0], sheetRowData[0][n][1], sheetRowData[0][n][2], sheetRowData[0][n][3], sheetRowData[0][n][4], sheetRowData[0][n][5],
                                        sheetRowData[0][n][6], sheetRowData[0][n][7], sheetRowData[0][n][8], sheetRowData[0][n][9], sheetRowData[0][n][10], sheetRowData[0][n][11],
                                        sheetRowData[0][n][12], sheetRowData[0][n][13], sheetRowData[0][n][14], sheetRowData[0][n][15], sheetRowData[0][n][16],
                                        sheetRowData[0][n][17], sheetRowData[0][n][18], sheetRowData[0][n][19], sheetRowData[0][n][20], sheetRowData[0][n][21], sheetRowData[0][n][22],
                                        sheetRowData[0][n][23], sheetRowData[0][n][24], sheetRowData[0][n][25], sheetRowData[0][n][26], sheetRowData[0][n][27], sheetRowData[0][n][28], sheetRowData[0][n][29]
                                    );
                                } 

                            }
                           
                            console.log("UDT name", udtName);
                            console.log("row Data length :-", column.rows.length);
                            req.input('seqNo', seqNo);
                            req.input(udtName, column);
                            req.input('UserID', sql.Int, 1)
                            // console.log('table :',column)
                            sendLoggers(0, convertDate(datecurrent), `Table prepared for spEmailImportRow`, "subject - " + emailSubject[0] + " file name - " + emailFileName[0])
                            req.execute('spEmailImportRow', function(err, recordsets, returnValue) {
                                // console.log(recordsets)
                                console.log(`spEmailImportRow recordsets :`)
                                if (err) {
                                    console.log(`spEmailImportRow error : `, err);
                                    sendLoggers(0, convertDate(datecurrent), `spEmailImportRow error : `, err)
                                } else {
                                    sendLoggers(0, convertDate(datecurrent), `spEmailImportRow executed successfully`, "subject - " + emailSubject[0] + " file name - " + emailFileName[0])
                                    sendLoggers(0, convertDate(datecurrent), "insert process ended for seqNo " + seqNo + "and doc no " + docNo, "subject - " + emailSubject[0] + " file name - " + emailFileName[0])
                                    localStorage.setItem('process','finished');
                                    resolve(recordsets)
                                }
                            })

                        } else {
                            console.log("return not udtName ");
                        }
                        //==========================
                    }
                });
                //============***==========


                //     }, 3000);
                // }
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
                    //  console.log(recordsets)
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
                // console.log('spGetEmailDetails', recordsets.recordsets);
                // console.log('spGetEmailDetails', recordsets);
                var totalMessageCount;
                var isDeleted = false;
                var subjectMain = '';
                imaps.connect(config).then(function(connection) {

                    connection.openBox('INBOX').then((mes) => {
                        // console.log('mes: ', mes);
                        console.log('recordsets: ', recordsets);
                        console.log("mail read started");
                        //get all message count.......................
                        totalMessageCount = mes['messages']['total'];
                        console.log('total message count: ', totalMessageCount);
                        // console.log('SeqNo: ', recordsets['recordsets'][1][0]['AMPMSeqNo']);
                        console.log('SeqNo: ', recordsets['recordsets'][0]);
                        // return;
                        console.log('SeqNo: ', recordsets['recordsets'][0][0]['InBoundSeqNo']);
                        // console.log('fileName: ', recordsets['recordsets'][1][0]['Name']);
                        //check total count and our table count is same or not if less then message get deleted....
                        if (totalMessageCount < recordsets['recordsets'][0][0]['InBoundSeqNo']) {
                            isDeleted = true;
                            //sp call to change count for so................
                            spUpdateEmailSeqNo(1, totalMessageCount);
                        }

                        searchCriteria = [
                            "5623"
                            //  `${isDeleted ? (totalMessageCount+1) : (recordsets['recordsets'][0][0]['InBoundSeqNo']+1)}:${isDeleted ? (totalMessageCount+10) : (recordsets['recordsets'][0][0]['InBoundSeqNo']+10)}`
                        ];

                        var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true }

                        return connection.search(searchCriteria, fetchOptions)
                    }).then(function(messages) {
                        if(localStorage != null && localStorage.getItem('process') != null && localStorage.getItem('process') == 'start'){
                            console.log('already one process running..........');
                            return;
                        }else{
                            localStorage.setItem('start');
                        }
                        var datecurrent = new Date()
                        sendLoggers(0, convertDate(datecurrent), "Process Start", "")
                        console.log("mail count : ", messages.length);
                        var attachments = [];
                        var msgFrom = '';
                        if (messages.length == 0) {
                            var datecurrent = new Date()
                            sendLoggers(0, convertDate(datecurrent), "no mails found", "")
                        } else {
                            sendLoggers(1, convertDate(messages[messages.length - 1].attributes.date), "sequence Number ", "", messages[messages.length - 1].seqNo)
                            messages.forEach(function(message) {
                                var from = extractEmails(message.parts[0].body.from[0]);
                                var subject = message.parts[0].body.subject[0];
                                subjectMain = subject;
                                // sendLoggers(1, convertDate(messages[messages.length - 1].attributes.date), "mails found with sequence Number ", "", messages[messages.length - 1].seqNo)
                                var parts = imaps.getParts(message.attributes);
                                var parts = imaps.getParts(message.attributes.struct);
                                // console.log(parts);
                                msgFor = 'inbound';
                                attachments = attachments.concat(parts.filter(function(part) {
                                    return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                                }).map(function(part) {
                                    return connection.getPartData(message, part)
                                        .then(function(partData) {
                                            console.log(partData.length)
                                            return {
                                                seqNo: message.seqNo,
                                                emailDetails: recordsets['recordset'][0],
                                                // emailDetails: ['sunil.p@benchmarksolution.com'],
                                                from: from,
                                                date: message.attributes.date,
                                                filename: part.params['name'],
                                                data: partData,
                                                subject: subject
                                            };
                                        });
                                }));
                            });
                        }
                        return Promise.all(attachments);
                    }).then((attachments) => {
                        // var attachments = list[0];
                        var msgFrom = msgFor;
                        // var msgFrom = 'outbound';
                        let promises = [];
                        var datecurrent = new Date()
                        console.log(`Attachments:${attachments.length} email date:`)
                        if (attachments.length == 0) {
                            sendLoggers(0, convertDate(datecurrent), "no attachment found", subjectMain)
                            console.log(`Attachments:${attachments.length} email date:`);
                            // res.send(`Attachments:${attachments.length} email date:`)
                            connection.end()
                        } else {
                            attachments.forEach(attach => {
                                sendLoggers(1, convertDate(attach.date), attachments.length + " attachment found ", subjectMain)
                                var arraybuffer = attach.data;
                                // console.log("arraybuffer :" + arraybuffer);

                                /* convert data to binary string */
                                var data = new Uint8Array(arraybuffer);
                                // console.log("32: " + data);
                                var arr = new Array();
                                for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                                var bstr = arr.join("");
                                try {
                                    var workSheetsFromBuffer;
                                    workSheetsFromBuffer = xlsx.parse(attach.data, { cellDates: true, raw: false, blankrows: false });
                                    if (workSheetsFromBuffer != null) {
                                        workSheetsFromBuffer.forEach(workbook => {
                                            var sheetColumnName = workbook.data[0];
                                            promises.push({
                                                'sheet': workbook.data,
                                                'date': convertDate(attach.date),
                                                'seq': attach.seqNo,
                                                'sheetColumnName': sheetColumnName,
                                                'from': attach.from,
                                                'subject': attach.subject,
                                                'filename': attach.filename
                                            })
                                        });
                                    } else {
                                        console.log("file type is not xlsx");
                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            });
                        }
                        return Promise.all(promises);

                    }).then((abc) => {

                        console.log('promises length : ', abc.length);
                        abc.forEach((element, i) => {
                            // if (i == 0) {
                            //    console.log("clm name : ", element.sheetColumnName);
                            setTimeout(() => {
                                var sheetColumnName = [];
                                var sheetRowData = [];
                                var emailFrom = [];
                                var emailSubject = [];
                                var emailFileName = [];
                                sheetColumnName.push(element.sheetColumnName);
                                sheetRowData.push(element.sheet);
                                emailFrom.push(element.from);
                                emailSubject.push(element.subject);
                                emailFileName.push(element.filename);
                                console.log("sheetRowData array :" + sheetRowData.length);
                                spColumnUdt(sheetColumnName, sheetRowData, emailFrom, emailSubject, emailFileName, element.seq, i + 1);
                            }, i * 2000);
                            // }

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