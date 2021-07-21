import config from '$config';
import aws from 'aws-sdk';
import multer from 'multer';
import md5 from 'md5';
import path from 'path';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    let arr_ext = (file.originalname || '').split('.');
    let md5FileName =
      arr_ext.length > 0 ? `${md5(file.originalname)}.${arr_ext[arr_ext.length - 1]}` : md5(file.originalname);
    cb(null, `${Date.now().toString()}-${md5FileName}`);
  },
});

var upload = multer({ storage: storage });

export default upload;
