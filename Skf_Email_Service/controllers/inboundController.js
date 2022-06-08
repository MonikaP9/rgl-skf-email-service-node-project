var config = require("../config/db.config");
const sql = require("mssql");
const { request } = require("express");
var XLSX = require('xlsx');
var http = require('http');
var fs = require('fs');
var cors = require('cors');

//get inboundList 
exports.inboundList = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance and passing in connection instance
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("WarehouseID", request.query.WarehouseID);
            req.input("PickerID", request.query.PickerID);
            req.input("StatusID", request.query.StatusID);

            //Execute store produce
            req.execute("spGetInboundlist", function(err, recordsets, returnValue) {
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
        //Handle connection error
        .catch(function(err) {
            console.log(err);
            conn.close();
        });

}

//get location 
exports.location = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("WarehouseID", request.query.WarehouseID);

            //Execute store produce
            req.execute("spGetLocation", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    res.send({
                        "error": 0,
                        "msg": recordsets.recordset
                    }, 200)
                }
            })
        })
        //Handle connection error
        .catch(function(err) {
            console.log(err);
            conn.close();
        });


}

// allocateProduct
exports.allocateProduct = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");
            req.input("WareHouseID", request.body.WarehouseID);
            req.input("PickerID", request.body.PickerID);
            req.input("invoiceNo", request.body.invoiceNo);
            req.input("number_of_picker", request.body.number_of_picker);

            //Execute store produce
            req.execute("spAllocateInBoundProduct", function(err, recordsets, returnValue) {
                if (err) res.send(err);
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    res.send({
                        "error": 0,
                        "msg": recordsets.recordset
                    }, 200)
                }
            })
        })

    //Handle connection error
    .catch(function(err) {
        console.log(err);
        conn.close();
    });

}

//get inboundDetails
exports.inboundDetails = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("WareHouseID", request.query.WarehouseID);
            req.input("PickerID", request.query.PickerID);
            req.input("invoiceNo", request.query.invoiceNo);

            //Execute store produce
            req.execute("spGetInboundDetails", function(err, recordsets, returnValue) {
                console.log("spGetInboundDetails");
                console.log(recordsets.recordset);
                if (err) res.send(err);
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
                        "msg": header
                    }, 200)
                }
            })

        })
        //Handle connection error
        .catch(function(err) {
            console.log(err);
            conn.close();
        });
}


//get updateInbound
exports.updateInbound = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance, passing in connnection instance
            var req = new sql.Request(conn);
            var udtInBoundDtlScan = new sql.Table();

            udtInBoundDtlScan.columns.add('InboundDtlID', sql.Int);
            udtInBoundDtlScan.columns.add('PickerID', sql.Int);
            udtInBoundDtlScan.columns.add('ScanDatetime', sql.VarChar(30));
            udtInBoundDtlScan.columns.add('Location', sql.VarChar(50));
            udtInBoundDtlScan.columns.add('Qty', sql.Int);
            udtInBoundDtlScan.columns.add('DeleteTime', sql.VarChar(30));


            var barcode = request.body.scannedData;
            console.log('barcode String :', barcode);
            // var barcodeList = JSON.parse(barcode);
            // console.log('barcode data :',barcodeList);

            barcode.forEach(element => {
                udtInBoundDtlScan.rows.add(element.InboundDtlID, element.PickerID,element.ScanDatetime, element.Location, element.Qty, element.DeleteTime != '' ? element.DeleteTime : null);
            });

            req.input("invoiceNo", request.body.invoiceNo);
			req.input("PickerID", request.body.PickerID);
            req.input("udtInBoundDtlScan", udtInBoundDtlScan);


            //Execute store produce
            req.execute("spUpdateInBound", function(err, recordsets, returnValue) {
                if (err) res.send(err);
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    res.send({
                        "error": 0,
                        "msg": recordsets.recordset
                    }, 200)
                }
            })

        })
        //Handle connection error
        .catch(function(err) {
            console.log(err);
            conn.close();
        });
}

//get_inbound_list_web
exports.inboundListWeb = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        // user_id, invoice_no(for filter),LR_No(for filter),
        // from_dc(for filter),Status(for filter)
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("user_id", request.query.user_id);
            req.input("invoice_no", request.query.invoice_no);
            req.input("LR_No", request.query.LR_No);
            req.input("From_DC", request.query.From_DC);
            req.input("StatusID", request.query.StatusID);
            req.input("FromDate", request.query.FromDate);
            req.input("ToDate", request.query.ToDate);

            req.execute("spGetInboundWebList", function(err, recordsets, returnValue) {
                // console.log(recordsets.recordset);
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.recordset.error_msg
                    })
                } else {
                    res.send({
                        "error": 0,
                        "msg": recordsets.recordset
                    }, 200)
                }
            })
        })

    //Handle connection exception
    .catch(function(err) {
        console.log(err);
        conn.close();
    })
}

//delete_inbound 
// spDeleteInboundWeb
// user_id, inbound_ID

exports.inboundDelete = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        // successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            req.input("user_id", request.query.user_id);
            req.input("inbound_ID", request.query.inbound_ID);

            req.execute("spDeleteInboundWeb", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    res.send({
                        "error": 0,
                        "msg": recordsets.recordset
                    }, 200)
                }

            })

        })
        .catch(function(err) {
            console.log(err);
            conn.close();
        })
}

//get_inbound_details_web
// spGetInboundWebDetails
// user_id, inbound_ID
exports.inboundDetailsWeb = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection 
        .then(function() {
            var req = new sql.Request(conn);
            req.input("user_id", request.query.user_id);
            req.input("inbound_ID", request.query.inbound_ID);


            req.execute("spGetInboundWebDetails", function(err, recordsets, returnValue) {
                console.log("spGetInboundWebDetails");
                // console.log(recordsets['recordsets']);
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output != "") {
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
                        var list = recordsets.recordsets != null && recordsets.recordsets.length > 0 ? recordsets.recordsets[1] : [];
                        console.log('list1 : ', list);
                        if (header != null)
                            header.list = list;

                        console.log(header['InvoiceNo']);
                        var file_Name = 'InboundData_' + header['InvoiceNo'] + '.xlsx';
                        file_Name = recordsets.recordsets != null && recordsets.recordsets.length > 0 ? file_Name : [];
                        // console.log('fileName : ', file_Name);
                        header.file_Name = file_Name;
                    } else {
                        console.log("null");
                    }
                    res.send({
                        "error": 0,
                        "msg": header
                    }, 200)
                }
            })

        })
        .catch(function(err) {
            console.log(err);
            conn.close();
        })
}


//post api for create inbound 
exports.createInbound = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        // Successfull connection
        .then(function() {
            // Create request instance, passing in connection instance
            var req = new sql.Request(conn);
            var column = new sql.Table();

            // user_id, Invoice Number, shipment date, from dc, transporter, Lr no, to dc,
            // total quantity, udtTableData(attached excel sheet data)
            column.columns.add('user_id', sql.VarChar(100));
            column.columns.add('Invoice_no', sql.VarChar(100));
            column.columns.add('shipment_date', sql.VarChar(100));
            column.columns.add('from_dc', sql.VarChar(10));
            column.columns.add('transporter', sql.VarChar(10));
            column.columns.add('Lr_no', sql.VarChar(10));
            column.columns.add('to_dc', sql.Char(2));
            column.columns.add('total_quantity', sql.Char(2));


            var currentDate = convertDate(new Date());
            console.log('current date : ', currentDate);
            barcode.forEach(element => {
                column.rows.add(element.user_id, element.Invoice_no, element.shipment_date, element.from_dc, element.transporter, element.Lr_no,
                    element.to_dc, element.total_quantity);
            });
            req.input('udtTableData', column);
            //Execute Store procedure  
            req.execute('spInsertInboundWeb', function(err, recordsets, returnValue) {
                console.log('recordset data : ', recordsets);
                console.log('error data : ', err);
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.DB != null && recordsets.output.DB != '') {
                    res.send(200, {
                        "error": 1,
                        "reference": recordsets.output.DB,
                        "data": recordsets.output.error_msg,
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


// To Download xlsx file link
// User_ID , invoice_No  spInboundDownload
exports.inboundDownloadXlsxFileLink = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection 
        .then(function() {
            var req = new sql.Request(conn);
            var isFromList = request.query.is_from_list;
            req.input("User_ID", request.query.User_ID);
            req.input("invoice_No", request.query.invoice_No);

            req.execute("spInboundSingleDownload", function(err, recordsets, returnValue) {
                // console.log(recordsets.recordset);
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    if (recordsets.recordset != null) {
                        var data = recordsets.recordset;
                        const ws = XLSX.utils.json_to_sheet(data)
                        const wb = XLSX.utils.book_new()
                        let d = new Date();
                        var currentDate = `${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}_${d.getHours()}_${d.getMinutes()}`;
                        var invoice_No = request.query.invoice_No != null && request.query.invoice_No != '' ? request.query.invoice_No : currentDate;
                        // var invoice_No = request.query.invoice_No; // 004201HNWSB1
                        // console.log('InboundData_' + invoice_No + '.xlsx');
                        XLSX.utils.book_append_sheet(wb, ws, 'Responses')
						console.log('123................');
                        XLSX.writeFile(wb, './document/InboundData_' + invoice_No + '.xlsx')
						console.log('1456................');
                            // var downloadLink = "E:/monika/node_project/Skf_Email_Service/document/InboundData_" + invoice_No + ".xlsx ";
                        var fileName = 'InboundData_' + invoice_No + '.xlsx';
                        if(isFromList != null && isFromList){
                            if(fileName != null && fs.existsSync('./document/'+fileName)){
                                //./document/InboundData_004201HNWSB1.xlsx
                                res.download("./document/"+fileName)
                            }else{
                                res.send(200, {
                                    "error": 1,
                                    "msg": 'Unable to process please check file name.'
                                })
                            }
                        }else{
                            var result = {
                                'fileName': fileName
                            }
                            res.send({
                                "error": 0,
                                "msg": result
                        }, 200)
                        }
                    

                    }else{
                        res.send({
                            "error": 1,
                            "msg": 'Data not available for download.'
                    }, 200)
                    }


                }
            })

        })
        .catch(function(err) {
            console.log(err);
            conn.close();
        })
}


// To Download xlsx file link
// User_ID , invoice_No  spInboundDownload
exports.inboundBulkDownloadXlsxFileLink = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection 
        .then(function() {
            var req = new sql.Request(conn);
            var isFromList = request.query.is_from_list;
            req.input("User_ID", request.query.User_ID);
            req.input("invoice_No", request.query.invoice_No);
            req.input("FromDate", request.query.FromDate);
            req.input("ToDate", request.query.ToDate);
            req.input("StatusID", request.query.StatusID);

            req.execute("spInboundDownload", function(err, recordsets, returnValue) {
                // console.log(recordsets.recordset);
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    if (recordsets.recordset != null) {
                        var data = recordsets.recordset;
                        const ws = XLSX.utils.json_to_sheet(data)
                        const wb = XLSX.utils.book_new()
                        let d = new Date();
                        var currentDate = `${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}_${d.getHours()}_${d.getMinutes()}`;
                        var invoice_No = request.query.invoice_No != null && request.query.invoice_No != '' ? request.query.invoice_No : currentDate;
                        // var invoice_No = request.query.invoice_No; // 004201HNWSB1
                        // console.log('InboundData_' + invoice_No + '.xlsx');
                        XLSX.utils.book_append_sheet(wb, ws, 'Responses')
						console.log('123................');
                        XLSX.writeFile(wb, './document/InboundData_' + invoice_No + '.xlsx')
						console.log('1456................');
                            // var downloadLink = "E:/monika/node_project/Skf_Email_Service/document/InboundData_" + invoice_No + ".xlsx ";
                        var fileName = 'InboundData_' + invoice_No + '.xlsx';
                        if(isFromList != null && isFromList){
                            if(fileName != null && fs.existsSync('./document/'+fileName)){
                                //./document/InboundData_004201HNWSB1.xlsx
                                res.download("./document/"+fileName)
                            }else{
                                res.send(200, {
                                    "error": 1,
                                    "msg": 'Unable to process please check file name.'
                                })
                            }
                        }else{
                            var result = {
                                'fileName': fileName
                            }
                            res.send({
                                "error": 0,
                                "msg": result
                        }, 200)
                        }
                    

                    }else{
                        res.send({
                            "error": 1,
                            "msg": 'Data not available for download.'
                    }, 200)
                    }


                }
            })

        })
        .catch(function(err) {
            console.log(err);
            conn.close();
        })
}

exports.downloadDoc=(request, res)=>{
    var fileName = request.query.file_name;
    console.log('filename : ',fileName);
    if(fileName != null && fs.existsSync('./document/'+fileName)){
        //./document/InboundData_004201HNWSB1.xlsx
        res.download("./document/"+fileName)
    }else{
        res.send(200, {
            "error": 1,
            "msg": 'Unable to process please check file name.'
        })
    }
}

//get inboundList 
exports.barcodeMaster = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance and passing in connection instance
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("account_id", request.query.accountId);
           

            //Execute store produce
            req.execute("spGetBarcodeConf", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    console.log(recordsets);
                    console.log('group by data : ',groupBy(recordsets.recordset, 'BarcodeType'));
                    res.send({
                        "error": 0,
                        "data": recordsets.recordset
                    }, 200)
                }

            })
        })
        //Handle connection error
        .catch(function(err) {
            console.log(err);
            conn.close();
        });

}

// function groupBy(list, keyGetter) {
//     const map = new Map();
//     list.forEach((item) => {
//          const key = keyGetter(item);
//          const collection = map.get(key);
//          if (!collection) {
//              map.set(key, [item]);
//          } else {
//              collection.push(item);
//          }
//     });
//     return map;
// }

var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };