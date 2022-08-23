const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({   
    userId:{type:String, default:null},
    productId:{type:String, default:null},
    createdAt:{type:Date, default:Date.now}
});

module.exports = Carts = mongoose.model('Carts', cartSchema);
