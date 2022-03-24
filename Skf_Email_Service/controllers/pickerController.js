var config = require("../config/db.config");
const sql = require("mssql");

//get warehouse List
exports.warehouseList = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //Successfull connection
        .then(function() {
            //create request instance,passing in connection instance

            var req = new sql.Request(conn);
            console.log("entered");
            //Execute store procedure

            req.execute("spGetWarehouse", function(err, recordsets, returnValue) {
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

//get picker List
exports.pickerList = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()

    //successfull connection
    .then(function() {
        //create request instance,passing in connection instance
        var req = new sql.Request(conn);
        console.log("entered");
        //Execute store procedure

        //call mssql's query method passing in params
        req.input("WarehouseID", request.query.WarehouseID);


        req.execute("spGetPickerlist", function(err, recordsets, returnValue) {
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
                    "data": recordsets.recordset
                }, 200)
            }
        })
    })

    //handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    });
}

//add picker...............
exports.addPicker = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");
            req.input("PickerName", request.body.PickerName);
            req.input("WareHouseID", request.body.WareHouseID);
			req.input("password", request.body.pass);
			req.output('errormsg', sql.VarChar(sql.MAX))

            //Execute store produce
            req.execute("spInsertPicker", function(err, recordsets, returnValue) {
                if (err) res.send(err);
                else
                if (recordsets.output != null && recordsets.output.errormsg != null && recordsets.output.errormsg != "") {
					//console.log("error : ",recordsets);
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.errormsg
                    })
                } else {
					//console.log("success : ",recordsets);
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

//delete picker....................
exports.deletePicker = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()

    //successfull connection
    .then(function() {
        //create request instance,passing in connection instance
        var req = new sql.Request(conn);
        //Execute store procedure

        //call mssql's query method passing in params
        req.input("PickerId", request.query.PickerId);


        req.execute("spDeletePicker", function(err, recordsets, returnValue) {
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
                    "data": recordsets.recordset
                }, 200)
            }
        })
    })

    //handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    });
}

//add location...............
exports.addLocation = (request, res) => {

    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            var req = new sql.Request(conn);
            console.log("entered");
            req.input("code", request.body.code);
            req.input("WareHouseID", request.body.WareHouseID);
			req.output('errormsg', sql.VarChar(sql.MAX))

            //Execute store produce
            req.execute("spInsertLocation", function(err, recordsets, returnValue) {
                if (err) res.send(err);
                else
                if (recordsets.output != null && recordsets.output.errormsg != null && recordsets.output.errormsg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.errormsg
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

//delete location....................
exports.deleteLocation = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()

    //successfull connection
    .then(function() {
        //create request instance,passing in connection instance
        var req = new sql.Request(conn);
        //Execute store procedure

        //call mssql's query method passing in params
        req.input("Code", request.query.Code);
        req.input("WareHouseID", request.query.WareHouseID);


        req.execute("spDeleteLocation", function(err, recordsets, returnValue) {
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
                    "data": recordsets.recordset
                }, 200)
            }
        })
    })

    //handle connection errors
    .catch(function(err) {
        console.log(err);
        conn.close();
    });
}

//Manage Product Details (getProduct)
exports.manageProductDetails = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection

    .then(function() {
        //create request instance and passing in connection instance
        var req = new sql.Request(conn);
        req.input("user_id", request.query.user_id);
        req.input("product_name", request.query.product_name);


        //Execute store produce
        req.execute("spGetProduct", function(err, recordsets, returnValue) {
            if (err) res.send(err)
            else
            if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                res.send(200, {
                    "error": 1,
                    "msg": recordsets.recordset.error_msg
                })
            } else {
                console.log(recordsets);
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
    })
}

//Delete Product (deleteProduct)
exports.deleteProduct = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection

    .then(function() {
        //create request instance and passing in connection instance
        var req = new sql.Request(conn);
        req.input("user_id", request.query.user_id);
        req.input("product_Id", request.query.product_Id);

        var getDate = convertDate(new Date());
        console.log('current date : ', getDate);
        req.input("DeletedDate", request.query.getDate);

        //Execute store produce
        req.execute("spDeleteProduct", function(err, recordsets, returnValue) {
            if (err) res.send(err)
            else
            if (recordsets.output != null && recordsets.output.error_msg != null && recordsets.output.error_msg != "") {
                res.send(200, {
                    "error": 1,
                    "msg": recordsets.recordset.error_msg
                })
            } else {
                console.log(recordsets);
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
    })
}

//add Product...............product, pack_code, box qty, commodity, udtTableData
exports.addProduct = (request, res) => {
    var conn = new sql.ConnectionPool(config);
    conn.connect()
        //successfull connection
        .then(function() {
            //create request instance, passing in connnection instance
            var req = new sql.Request(conn);
            console.log("entered");

            req.input("product", request.body.product);
            req.input("pack_code", request.body.pack_code);
            req.input("box_qty", request.body.box_qty);
            req.input("commodity", request.body.commodity);
			req.output('errormsg', sql.VarChar(sql.MAX))

            //Execute store produce
            req.execute("spInsertProduct", function(err, recordsets, returnValue) {
                if (err) res.send(err);
                else
                if (recordsets.output != null && recordsets.output.errormsg != null && recordsets.output.errormsg != "") {
                    res.send(200, {
                        "error": 1,
                        "msg": recordsets.output.errormsg
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

//update Product
exports.updateProduct = (request, res) => {
        var conn = new sql.ConnectionPool(config);
        conn.connect()
            //successfull connection
            .then(function() {
                //create request instance, passing in connnection instance
                var req = new sql.Request(conn);

                req.input("product_ID", request.body.product_ID);
                req.input("product", request.body.product);
                req.input("pack_code", request.body.pack_code);
                req.input("box_qty", request.body.box_qty);
                req.input("commodity", request.body.commodity);
				req.output('errormsg', sql.VarChar(sql.MAX))

                //Execute store produce
                req.execute("spUpdateProduct", function(err, recordsets, returnValue) {
                    if (err) res.send(err);
                    else
                    if (recordsets.output != null && recordsets.output.errormsg != null && recordsets.output.errormsg != "") {
                        res.send(200, {
                            "error": 1,
                            "msg": recordsets.output.errormsg
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
    //validate Date & convert
function convertDate(time) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(time - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    var mySqlDT = localISOTime;
    return mySqlDT;
}