const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const crypto = require("crypto")
const path = require('path')
const GridFsStorage = require("multer-gridfs-storage")
const router = express.Router()


// DB
const mongoURI = "mongodb+srv://Idrok:riskiddin98@cluster0.thx7q.mongodb.net/testg";

// connection
const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, console.log('2-mongodb'));

// init gfs
let gfs;
conn.once("open", () => {
    // init stream
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads"
    });
});

// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads"
                };
                resolve(fileInfo);
            });
        });
    }
});
//const storage = new GridFsStorage({ url: mongoURI }) // soddaroq usuli

const upload = multer({
    storage
});

// route'lar
router.get("/admin/images", (req, res) => {
    if (!gfs) {
        const error = "Kutilmagan xato yuz berdi.";
        console.log(error);
        res.send(error);
        process.exit(0);
    }
    gfs.find().toArray((err, files) => {
        // check if files
        if (!files || files.length === 0) {
            return res.render("admin/index", {
                files: false
            });
        } else {
            const f = files
                .map(file => {
                    if (
                        file.contentType === "image/png" ||
                        file.contentType === "image/jpeg"
                    ) {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
                    return file;
                })
                .sort((a, b) => {
                    return (
                        new Date(b["uploadDate"]).getTime() -
                        new Date(a["uploadDate"]).getTime()
                    );
                });

            return res.render("admin/index", {
                files: f
            });
        }

        // return res.json(files);
    });
});

router.post("/admin/upload", upload.single("file"), (req, res) => {
    res.redirect("/admin/images");
});

router.get("/admin/files", (req, res) => {
    gfs.find().toArray((err, files) => {
        // fayl mavjudligini tekshiramiz
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: "bironta ham fayl mavjud emas"
            });
        }

        return res.json(files);
    });
});

router.get("/admin/files/:filename", (req, res) => {
    gfs.find(
        {
            filename: req.params.filename
        },
        (err, file) => {
            if (!file) {
                return res.status(404).json({
                    err: "bunday fayl mavjud emas"
                });
            }

            return res.json(file);
        }
    );
});

router.get("/admin/image/:filename", (req, res) => {
    const file = gfs
        .find({
            filename: req.params.filename
        })
        .toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: "bunday rasm mavjud emas"
                });
            }
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        });
});

// files/del/:id
// faylni database'dan o'chiramiz
router.post("/admin/files/del/:id", (req, res) => {
    gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
        if (err)
            return res.status(404).json({ err: err.message });

        res.redirect("/admin/images");
    })
})

module.exports = router