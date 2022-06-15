var config = require("../config/db.config");
const sql = require("mssql");
var configemail = require('../config/autoMail.config');
const pug = require('pug');
var fs = require('fs');
var XLSX = require('xlsx');
var nodemailer = require('nodemailer');
var pixelWidth = require('string-pixel-width');

//get master data...............
exports.getMasterData = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //Successfull connection
        .then(function() {
            //create request instance,passing in connection instance

            var req = new sql.Request(conn);
            console.log("entered");
            //Execute store procedure

            req.execute("spget_master_data", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    console.log(recordsets);
                    res.send({
                        "error": 0,
                        "data": recordsets.recordset
                    }, 200)
                }
            })
        })

    //Handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    });

}

//get picking List.........
exports.getPicklistData = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //Successfull connection
        .then(function() {
            //create request instance,passing in connection instance

            var req = new sql.Request(conn);
            console.log("entered");
            //Execute store procedure

            req.execute("sp_get_PickList", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    console.log(recordsets);
                    res.send({
                        "error": 0,
                        "data": recordsets.recordset
                    }, 200)
                }
            })
        })

    //Handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    });

}

//get picking List.........
exports.getPickDetails = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //Successfull connection
        .then(function() {
            //create request instance,passing in connection instance

            var req = new sql.Request(conn);
            console.log("entered");
            //Execute store procedure
            req.input("PickingID", request.query.PickingID);


            req.execute("spGetPicklistDetails", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    var header;
                    if (recordsets != null) {
                        console.log(recordsets);
                        header = recordsets.recordsets != null && recordsets.recordsets[0].length > 0 ? recordsets.recordsets[0][0] : null;
                        console.log('header :', header);
                        var productDetailsList = recordsets.recordsets != null && recordsets.recordsets.length > 0 ? recordsets.recordsets[1] : [];
                        console.log('list1 : ', productDetailsList);
                        if (header != null)
                            header.productDetailsList = productDetailsList;
                    } else {
                        console.log("null");
                    }

                    res.send({
                        "error": 0,
                        "data": header
                    }, 200)
                }
            })
        })

    //Handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    });

}

//post api for create scan.............
exports.addScan = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        // Successfull connection
        .then(function() {
            // Create request instance, passing in connection instance
            var req = new sql.Request(conn);

    
            req.input('sku_part_no', request.body.skuPartNo);
            req.input('packing_slip_barcode', request.body.packSlipBarcode);
            req.input('customer_partno', request.body.custPartNo);
            req.input('box_qty', request.body.boxQty);
            req.input('status', request.body.status);
            req.input('OutboundDtlID', request.body.outboundDtlId);
            req.input('ScanBoxes', request.body.scanBoxes);
            req.input('PickerID', request.body.PickerID);
            req.input('PickingID', request.body.PickingID);

            //Execute Store procedure  
            req.execute('spinsert_scan_data', function(err, recordsets, returnValue) {
                console.log('recordset data : ', recordsets);
                console.log('error data : ', err);
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.errormsg != null && recordsets.output.errormsg != '') {
                    res.send(200, {
                        "error": 1,
                        "reference": recordsets.output.DB,
                        "data": recordsets.output.errormsg,
                    })
                } else {
                    res.send({
                        "error": 0,
                        "data": recordsets.recordset,
                    }, 200)
                }

            });
        })
        // Handle connection errors
        .catch(function(err) {
            console.log(err);
            conn.close();
        });
}

//auto mail...................
exports.autoMail = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    var transporter = nodemailer.createTransport(configemail);

    conn.connect()
        // Successfull connection
        .then(function () {
            // Create request instance, passing in connection instance
            var req = new sql.Request(conn);
            // Call mssql's query method passing in params
            req.execute('sp_get_scan_data', async function(err, recordset, returnValue) {
				
                    console.log("header details : ",recordset.recordsets[0]);
                    console.log("sheet details : ",recordset.recordsets[1]);

                    if(err){
                        console.log(err);
                        res.send(err);
                    }
                    // res.send(recordset)

                    if(recordset != null && recordset.recordsets[1].length > 0){
                        console.log('123.............................');
                        try{
                            var data = recordset.recordsets[1];
                            var json = JSON.stringify(data);
                            var bufferData = Buffer.from(json);
                            const ws = XLSX.utils.json_to_sheet(data)
                            const wb = XLSX.utils.book_new()
                            console.log('sheet width : ',_autoFitColumns(data, ws));
                            const wscols = _autoFitColumns(data, ws)
                            ws['!cols'] = wscols
                            XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
                            var subject = recordset.recordsets[0][0].subject;
                            var path = './document/'+subject+'.xlsx';
                            var dir = './document';
                            if (!fs.existsSync(dir)){
                                console.log('a...');
                                fs.mkdirSync(dir);
                                XLSX.writeFile(wb, path)
                            }else{
                                console.log('b...');
                                var fileDir = path;
                                if (fs.existsSync(fileDir)){
                                    console.log('c...');
                                    fs.unlinkSync(fileDir);
                                    XLSX.writeFile(wb, path);
                                }else{
                                    console.log('d...');
                                    XLSX.writeFile(wb, path);
                                } 
                            }
                        
                            var mailOptions = {
                                from: configemail.auth.user,
                                // to: recordset.recordsets[0][0].ToAccount,
                                to: 'sunil.p@benchmarksolution.com',
                                // cc: recordset.recordsets[0][0].BccAccount,
                                subject: recordset.recordsets[0][0].subject,
                                html: recordset.recordsets[0][0].Body,
                                attachments: [
                                    {
                                        fileName: 'myFile.xlsx',
                                        path : path
                                      }
                                ]
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log("mail sender error : ",error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                    res.send({
                                        "error": 0,
                                        "data": info.response,
                                    }, 200)
                                }
                            });

                        }catch(e){
                            console.log('mail exception : ',e);
                        }
                       
                    }
                    conn.close();
                })
        })
        // Handle connection errors
        .catch(function (err) {
            console.log(err);
            conn.close();
        });
}

//validate Date & convert
function convertDate(time) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(time - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    var mySqlDT = localISOTime;
    return mySqlDT;
}

const _autoFitColumns = (json, worksheet, header) => {
    const jsonKeys = header || Object.keys(json[0])

    const objectMaxLength = []
    jsonKeys.forEach((key) => {
      objectMaxLength.push(
        pixelWidth(key, {
          size: 2,
        })
      )
    })

    json.forEach((data, i) => {
      const value = json[i]
      jsonKeys.forEach((key, j) => {
        const l = value[jsonKeys[j]]
          ? jsonKeys[j] == 'Scan Datetime' ? 12 : pixelWidth(value[jsonKeys[j]], {
              size: 2,
            })
          : 0
        objectMaxLength[j] = objectMaxLength[j] >= l ? objectMaxLength[j] : l
      })
    })

    return objectMaxLength.map((w) => {
      return { width: w }
    })
  }

  exports.apkDownload = (request, res) => {
    var fileName = 'skf_honda_app.apk';
    if(fileName != null && fs.existsSync('./document/'+fileName)){
        //./document/InboundData_004201HNWSB1.xlsx
        res.download("./document/"+fileName)
    }else{
        res.send({
            'error' : 'Unable to download apk file.'
        });
    }
}