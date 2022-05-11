var config = require("../config/db.config");
const sql = require("mssql");

//get dashboard inbound outbound count
exports.inbound_outboundCount = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance,passing in connection instance

            var req = new sql.Request(conn);
            console.log("entered");

            req.input("warehouseID", request.query.warehouseID);
            req.input("PickerID", request.query.PickerID);

            //Execute store produre

            req.execute("spGetDashboardCount", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null & recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    res.send({
                        "errors": 0,
                        "data": recordsets.recordset
                    }, 200)
                }
            })
        })

    //handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    })
}

//get dashboard inbound outbound count
exports.dashboardData = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance,passing in connection instance

            var req = new sql.Request(conn);
            console.log("entered");

            req.input("warehouseid", request.query.warehouseid);

            //Execute store produre

            req.execute("spGetDashboardData", function(err, recordsets, returnValue) {
                if (err) res.send(err)
                else
                if (recordsets.output != null && recordsets.output.error_msg != null & recordsets.output.error_msg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.error_msg
                    })
                } else {
                    console.log('result : ',recordsets);
                    console.log('result0 : ',recordsets['recordsets'][0]);
                    console.log('result1 : ',recordsets['recordsets'][1]);
                    console.log('result2 : ',recordsets['recordsets'][2]);
                    header = recordsets.recordsets != null && recordsets.recordsets[0].length > 0 ? recordsets.recordsets[0][0] : null;
                    console.log('header :', header);
                    var inboundProductivityDetailsList = recordsets.recordsets != null && recordsets.recordsets.length > 0 ? recordsets.recordsets[1] : [];
                    console.log('list1 : ', inboundProductivityDetailsList);
                    var outboundProductivityDetailsList = recordsets.recordsets != null && recordsets.recordsets.length > 0 ? recordsets.recordsets[2] : [];
                    console.log('list1 : ', inboundProductivityDetailsList);
                    if (header != null)
                        header.inboundProductivityDetailsList = inboundProductivityDetailsList;
                        header.outboundProductivityDetailsList = outboundProductivityDetailsList;
                    // console.log('result3 : ',recordsets['recordsets'][3]);
                    // console.log('result4 : ',recordsets['recordsets'][4]);
                    // console.log('result5 : ',recordsets['recordsets'][5]);
                    res.send({
                        "errors": 0,
                        "data": header
                    }, 200)
                }
            })
        })

    //handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    })
}