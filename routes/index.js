var db = require("../db_config/db_config").localConnect();
var express = require("express");
var router = express.Router();
var multer = require("multer");
let fs = require("fs");

const app = express();

/* GET home page. */
var userController = require("../controller/userController.js");

const upload = multer({
  dest: "./uploads"
});

/* GET home page. */
router.get("/", function(req, res, next) {
  res.json([
    {
      id: 1,
      username: "samsepi0l"
    },
    {
      id: 2,
      username: "D0loresH4ze"
    }
  ]);
});

router.post("/files", upload.single("pro"), function(req, res, next) {
  var bookDetail = req.body;

  if (req.file) {
    let sql =
      "insert into fil (file_path,name) values ('" +
      req.file.filename +
      "', '" +
      bookDetail.name +
      "')";

    db.query({ sql: sql }, function(err, rows, fields) {
      if (err) throw err;

      res.json({
        status: true,
        message: "Book uploaded Successfully",
        book_name: bookDetail.book_name,
        name_on_server: req.file.filename
      });
    });
  } else {
    res.json({
      status: false,
      message: "Oops, some error occurred"
    });
  }
});

router.get("/fetchvideobyid", function(req, res, next) {
  var videoId = req.query.id;

  let sql = "select * from fil where id = '" + videoId + "'";

  db.query({ sql: sql }, function(err, rows, fields) {
    if (err) throw err;
    try {
      res.header("Content-type", "video");

      fs.readFile(
        __dirname + "/../../tutor_api-master/uploads/" + rows[0].file_path,
        (err, data) => {
          if (err) throw err;
          res.send(data);
        }
      );
    } catch (err) {
      res.header("Content-type", "Application/json");
      res.json({
        status: "ERROR",
        error: err
      });
    }
  });
});

router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.post("/addclass", userController.addClass);
router.post("/addsubject", userController.addSubject);
router.get("/fetchteacher", userController.fetchTeacher);
router.get("/fetchclass", userController.fetchClass);
router.post("/fetchsubject", userController.fetchSubject);
router.post("/makeannouncement", userController.makeAnnouncement);
router.post("/addevent", userController.addEvent);
router.post("/fetch", userController.fetchData);

module.exports = router;
