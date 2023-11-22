const multer = require('multer');
const path = require('path');
                    
const uploads = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.diskStorage({
        destination: function(req, file, cb){
            cb(null,'./uploads');
        },
        
        filename: function (req, file, cb) {
            return cb(null, `${Date.now()}-${file.originalname}`)
        }
    }),
    fileFilter: function(req,file,cb){
        let extension = path.extname(file.originalname);
        if( extension !== '.png' && 
            extension !== '.jpg' && 
            extension !== '.jpeg' && 
            extension !== '.mp4'  && 
            extension !== '.webp'
        ){
            return cb(new Error(`Unsupported file type! ${extension}`), false);       
        }
        cb(null, true);
    },
});

module.exports = uploads;
