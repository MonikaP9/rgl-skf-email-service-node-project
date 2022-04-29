var config = require("../config/db.config");
const sql = require("mssql");
const { request } = require("express");
var XLSX = require('xlsx');
var http = require('http');
var fs = require('fs');
var cors = require('cors');

//get outboundList 
exports.outboundList = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance and passing in connection instance
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("WareHouseID", request.query.WareHouseID);
            req.input("PickerID", request.query.PickerID);
            req.input("StatusID", request.query.StatusID);

            //Execute store produce
            req.execute("spGetOutBoundList", function(err, recordsets, returnValue) {
                console.log(recordsets.recordset.length);
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    //  console.log(recordsets);
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

//get outboundDetails
// WarehouseID, PickerID, PickingID
// spGetOutboundDetails
exports.outboundDetails = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");

            //  req.input("WareHouseID", request.query.WarehouseID);
            req.input("WareHouseID", request.query.WareHouseID);
            req.input("PickerID", request.query.PickerID);
            req.input("PickingID", request.query.PickingID);

            //Execute store produce
            req.execute("spGetOutboundDetails", function(err, recordsets, returnValue) {
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

// update_outbound
// spUpdateInBound post
// InvoiceNo,udtOutBoundDtlScan

exports.updateOutbound = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance, passing in connnection instance
            var req = new sql.Request(conn);
            var udtOutBoundDtlScan = new sql.Table();

            udtOutBoundDtlScan.columns.add('OutBoundDtlID', sql.Int);
            udtOutBoundDtlScan.columns.add('PickerID', sql.Int);
            udtOutBoundDtlScan.columns.add('ScanningDtetime', sql.VarChar(30));
            udtOutBoundDtlScan.columns.add('BinLocation', sql.VarChar(50));
            udtOutBoundDtlScan.columns.add('Qty', sql.Int);
            udtOutBoundDtlScan.columns.add('DeleteDatetime', sql.VarChar(30));
			udtOutBoundDtlScan.columns.add('SeqNo', sql.Int);


            var barcode = request.body.scannedData;
            console.log('barcode String :', barcode);
            // var barcodeList = JSON.parse(barcode);
            // console.log('barcode data :',barcodeList);

            barcode.forEach(element => {
                udtOutBoundDtlScan.rows.add(element.OutBoundDtlID, element.PickerID, element.ScanningDtetime, 
				element.BinLocation, element.Qty, element.DeleteDatetime != '' ? element.DeleteDatetime : null,element.SeqNo);
            });

            req.input("PickingID", request.body.PickingID);
			req.input("PickerID", request.body.PickerID);
            req.input("udtOutBoundDtlScan", udtOutBoundDtlScan);


            //Execute store produce
            req.execute("spUpdateOutBound", function(err, recordsets, returnValue) {
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


//get allocate_Outbound_product
exports.allocateProductOutBound = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        // WarehouseID, PickerID, PickingID, number_of_picker
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");
            req.input("WareHouseID", request.body.WarehouseID);
            req.input("PickerID", request.body.PickerID);
            req.input("PickingID", request.body.PickingID);
            req.input("number_of_picker", request.body.number_of_picker);

            //Execute store produce
            req.execute("spAllocateOutBoundProduct", function(err, recordsets, returnValue) {
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

//spGetOutboundWebList
//user_id, picking_ID(for filter),Status(for filter)
exports.outboundListWeb = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("user_id", request.query.user_id);
            req.input("picking_ID", request.query.picking_ID);
            req.input("StatusID", request.query.StatusID);

            req.execute("spGetOutboundWebList", function(err, recordsets, returnValue) {
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

// get_Outbound_details_web
//  user_id, picking_id
exports.outboundDetailsWeb = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection 
        .then(function() {
            var req = new sql.Request(conn);
            req.input("user_id", request.query.user_id);
            req.input("picking_id", request.query.picking_id);

            req.execute("spGetOutboundWebDetails", function(err, recordsets, returnValue) {
                console.log("recordsets");
                console.log(recordsets);

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
                        //   console.log(recordsets);
                        header = recordsets.recordsets != null && recordsets.recordsets[0].length > 0 ? recordsets.recordsets[0][0] : null;
                        //  console.log('header :', header);
                        var orderDetails = recordsets.recordsets != null && recordsets.recordsets.length > 0 ? recordsets.recordsets[1] : [];
                        //  console.log('list1 : ', list);
                        if (header != null)
                            header.orderDetails = orderDetails;
                        var pickerDetails = recordsets.recordsets != null && recordsets.recordsets.length > 0 ? recordsets.recordsets[2] : [];
                        if (header != null)
                            header.pickerDetails = pickerDetails;
                        // console.log(header);
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

// delete_outbound
// spDeleteOutboundWeb
// user_id, picking_ID

exports.outboundDelete = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        // successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            req.input("user_id", request.query.user_id);
            req.input("picking_ID", request.query.picking_ID);

            req.execute("spDeleteOutboundWeb", function(err, recordsets, returnValue) {
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

// To bulk Download xlsx file link
// User_ID , invoice_No  spOutboundDownload
exports.outboundDownloadXlsxFileLink = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection 
        .then(function() {
            var req = new sql.Request(conn);
            var isFromList = request.query.is_from_list;
            req.input("User_ID", request.query.User_ID);
            req.input("PickingID", request.query.PickingID);
            req.input("FromDate", request.query.FromDate);
            req.input("ToDate", request.query.ToDate);
            req.input("StatusID", request.query.StatusID);

            console.log('picking id : ',request.query.PickingID);

            req.execute("spOutBoundDownload", function(err, recordsets, returnValue) {
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
                        var PickingID = request.query.PickingID != null && request.query.PickingID != '' ? request.query.PickingID : currentDate; // 004201HNWSB1
                        // console.log('InboundData_' + invoice_No + '.xlsx');
                        XLSX.utils.book_append_sheet(wb, ws, 'Responses')
						console.log('123................');
                        XLSX.writeFile(wb, './document/OutboundData_' + PickingID + '.xlsx')
						console.log('1456................');
                            // var downloadLink = "E:/monika/node_project/Skf_Email_Service/document/InboundData_" + invoice_No + ".xlsx ";
                        var fileName = 'OutboundData_' + PickingID + '.xlsx';
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