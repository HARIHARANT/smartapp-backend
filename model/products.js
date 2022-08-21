const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({   
    id:{type:String, default:null},
    title:{type:String, default:null},
    description:{type:String, default:null},
    price:{type:String, default:null},
    discountPercentage:{type:String, default:null},
    rating:{type:String, default:null},
    stock:{type:String, default:null},
    brand:{type:String, default:null},
    category:{type:String, default:null},
    thumbnail:{type:String, default:null},
    images:{type:Array, default:null},
});

module.exports = ProductsRecord = mongoose.model('Products', productsSchema);