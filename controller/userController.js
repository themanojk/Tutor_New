var db = require("../db_config/db_config").localConnect();
var axios = require("axios");
var mysql = require("mysql");
var multer = require("multer");
var path = require("path");
var fs = require("fs");

//////////          login        /////////////

var login = function(req, res, next) {
  var user = req.body;
  var response = new Array();

  var table_name;

  if (user.usertype == "0") {
    table_name = "ts_student";
  } else if (user.usertype == "1") {
    table_name = "ts_teacher";
  } else {
    table_name = "ts_school";
  }

  let sql =
    "select * from " +
    table_name +
    " where email = '" +
    user.email +
    "' AND password = '" +
    user.password +
    "'";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (rows.length > 0) {
      response.push({
        status: "true",
        message: "Login Success",
        result: rows[0]
      });
    } else {
      response.push({ status: "false", message: "Invalid email or password" });
    }

    res.send(JSON.stringify(response[0]));
  });
};

////// Add Teacher or student//////////////////

var signup = function(req, res, next) {
  var user = req.body;
  var response = new Array();
  var table_name;
  let sql;
  if (user.usertype == "0") {
    table_name = "ts_student";
    sql =
      "insert into " +
      table_name +
      " (f_name,l_name,father_name,email,mobile,password,school,class,is_delete) VALUES ('" +
      user.f_name +
      "','" +
      user.l_name +
      "','" +
      user.father_name +
      "','" +
      user.email +
      "','" +
      user.mobile +
      "','" +
      user.password +
      "','" +
      user.school +
      "','" +
      user.class +
      "','0')";
  } else {
    table_name = "ts_teacher";
    sql =
      "insert into " +
      table_name +
      " (f_name,l_name,email,mobile,password,school,class,subject,is_delete) VALUES ('" +
      user.f_name +
      "','" +
      user.l_name +
      "','" +
      user.email +
      "','" +
      user.mobile +
      "','" +
      user.password +
      "','" +
      user.school +
      "','" +
      user.class +
      "','" +
      user.subject +
      "','0')";
  }

  validate(user.email, user.mobile, function(data) {
    var valid = data;

    if (valid) {
      db.query({ sql: sql }, function(err, rows, fields) {
        if (rows.insertId != null) {
          response.push({
            status: "true",
            message: "success",
            user_id: rows.insertId
          });
        } else {
          response.push({ status: "false", message: "Some error occurred" });
        }

        res.send(JSON.stringify(response[0]));
      });
    } else {
      response.push({
        status: "false",
        message: "You are already registered with us"
      });
      res.send(JSON.stringify(response[0]));
    }
  });
};

//////         Add Classs//////////////////

var addClass = function(req, res, next) {
  var user = req.body;
  var response = new Array();

  let validate =
    "select id from ts_class where class = '" +
    user.class +
    "' AND school_id = '" +
    user.school_id +
    "'";

  db.query({ sql: validate }, function(err, rows, fields) {
    if (rows.length > 0) {
      response.push({
        status: "false",
        message: "This class is already added"
      });
      res.send(JSON.stringify(response[0]));
    } else {
      let sql =
        "insert into ts_class (class, school_id) VALUES ('" +
        user.class +
        "','" +
        user.school_id +
        "')";

      db.query({ sql: sql }, function(err, rows, fields) {
        if (err) throw err;

        response.push({ status: "true", message: "Class added successfully" });
        res.send(JSON.stringify(response[0]));
      });
    }
  });
};

////////////                Add Subject  /////////////////

var addSubject = function(req, res, next) {
  var user = req.body;
  var response = new Array();

  let validate =
    "select id from ts_subject where subject = '" +
    user.subject +
    "' AND school_id = '" +
    user.school_id +
    "' AND class = '" +
    user.class +
    "'";

  db.query({ sql: validate }, function(err, rows, fields) {
    if (rows.length > 0) {
      response.push({
        status: "false",
        message: "This subject is already added"
      });
      res.send(JSON.stringify(response[0]));
    } else {
      let sql =
        "insert into ts_subject (subject,class, school_id) VALUES ('" +
        user.subject +
        "','" +
        user.class +
        "','" +
        user.school_id +
        "')";

      db.query({ sql: sql }, function(err, rows, fields) {
        if (err) throw err;

        response.push({ status: "true", message: "Class added successfully" });
        res.send(JSON.stringify(response[0]));
      });
    }
  });
};

////////////////            Fetch Classs                   /////////////////

var fetchClass = function(req, res, next) {
  var id = req.query.school_id;

  var response = new Array();

  let sql = "select id,class from ts_class where school_id = '" + id + "'";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (rows.length >= 0) {
      response.push({ status: "true", message: "Classes", classes: rows });
    } else {
      response.push({ status: "false", message: "Some error occurred" });
    }
    res.send(JSON.stringify(response[0]));
  });
};

///////////////////               Fetch Subject             //////////////////

var fetchSubject = function(req, res, next) {
  var user = req.body;

  var response = new Array();

  let sql =
    "select id,subject,class from ts_subject where class = '" +
    user.class +
    "' AND school_id = '" +
    user.school_id +
    "'";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (err) throw err;

    //if (rows.length >= 0) {
    response.push({ status: "true", message: "Classes", classes: rows });
    // } else {
    //   response.push({ status: "false", message: "Some error occurred" });
    // }
    res.send(JSON.stringify(response[0]));
  });
};

/////////////////////////                       Make Announcement              ////////////////

var makeAnnouncement = function(req, res, next) {
  var user = req.body;
  var response = new Array();

  let sql =
    "insert into ts_announcement (message,class,school_id) VALUES ('" +
    user.message +
    "','" +
    user.class +
    "','" +
    user.school_id +
    "')";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (rows.insertId != null) {
      response.push({
        status: "true",
        message: "success",
        announce_id: rows.insertId
      });
    } else {
      response.push({ status: "false", message: "Some error occurred" });
    }
    res.send(JSON.stringify(response[0]));
  });
};

///////////////////////Add Event/////////////////////

var addEvent = function(req, res, next) {
  var user = req.body;
  var response = new Array();

  let sql =
    "insert into ts_event (message,school_id) values ('" +
    user.message +
    "','" +
    user.school_id +
    "')";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (rows.insertId != null) {
      response.push({
        status: "true",
        message: "success",
        announce_id: rows.insertId
      });
    } else {
      response.push({ status: "false", message: "Some error occurred" });
    }
    res.send(JSON.stringify(response[0]));
  });
};

//////////////////////                         Fetch Teacher            ////////////.

var fetchTeacher = function(req, res, next) {
  var id = req.query.school_id;
  var response = new Array();

  let sql =
    "select id,f_name,l_name,email,mobile,class,subject from ts_teacher where school = '" +
    id +
    "'";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (err) throw err;

    if (rows.length >= 0) {
      response.push({ status: "true", message: "Classes", classes: rows });
    } else {
      response.push({ status: "false", message: "No teachers to show" });
    }
    res.send(JSON.stringify(response[0]));
  });
};

var fetchData = function(req, res, next) {
  fetchMain()
    .then(function(response) {
      res.json(response);
    })
    .catch(function(err) {
      res.send(err);
    });
};

function fetchMain() {
  return new Promise((success, reject) => {
    var response = [];
    let classes = [];
    let sql = "select * from users";
    db.query({ sql: sql }, function(err, rows, fields) {
      if (err) reject(err);

      if (rows.length >= 0) {
        let tempData = [];

        for (let row of rows) {
          db.query(
            { sql: `Select * from news where roll_no = ${row.roll_no}` },
            async (err, data, fields) => {
              // console.log(data[0].text);
              row.news = data[0].text;
              console.log(row);
              classes.push(row);
              await response.push({
                status: "true",
                message: "Classes",
                classes: classes
              });
              // res.json(response[0]);
            }
          );
        }
        success(response);
        console.log(classes);
      } else {
        response.push({ status: "false", message: "No teachers to show" });
        success(response);
      }
    });
  });
}

//www.w3schools.com/sql/sql_join.asp

/////////////////////                  validate              ///////////////
var validate = function(email, mobile, callback) {
  let sql =
    "select id from ts_student where email = '" +
    email +
    "' OR mobile = '" +
    mobile +
    "'";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (err) throw err;

    if (rows.length > 0) {
      callback(false);
    } else {
      let sql =
        "select id from ts_teacher where email = '" +
        email +
        "' OR mobile = '" +
        mobile +
        "'";

      db.query({ sql: sql }, function(err, rows, fields) {
        if (err) throw err;

        if (rows.length > 0) {
          callback(false);
        } else {
          callback(true);
        }
      });
    }
  });
};

module.exports = {
  login: login,
  signup: signup,
  addClass: addClass,
  fetchTeacher: fetchTeacher,
  addSubject: addSubject,
  fetchClass: fetchClass,
  fetchSubject: fetchSubject,
  makeAnnouncement: makeAnnouncement,
  addEvent: addEvent,
  fetchData: fetchData
};
