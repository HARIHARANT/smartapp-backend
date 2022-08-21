// Importing modules
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./model/users")
const ProductsRecord = require("./model/products");
const Cart = require("./model/cart");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
const jwtSecretKey = process.env.JWT_SECRET_KEY; 

function verifyToken(req, res, next) {
	console.log("Inside verifyToken::");		
	console.log(jwtSecretKey);
    try {
		console.log("req::");
		console.log(req);
		let token = req.headers.authorization.split("Bearer");
		if(token){
			token = req.headers.authorization.split("Bearer")[1].trim();
		}        
		console.log("token:: "+token);
        const verified = jwt.verify(token, jwtSecretKey);
		console.log(verified);
        if(verified){
			next();
            //return res.status(200).send({"message":"Successfully Verified"});
        }else{
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }			
}
// Handling post request
app.post("/login", async (req, res, next) => {
	console.log("Login::");
	console.log(req.body);
	let { email, password } = req.body;
    
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
		console.log("existingUser::")
		console.log(existingUser)
	} catch {
		const error = new Error("Error! Something went wrong.");
		return next(error);
	}
	if (!existingUser) {
		const error = Error("Wrong details please check at once");
		return next(error);
	}
	let token;
	try {
		// decrypt password		
		console.log(existingUser.password)
		if(bcrypt.compareSync(password, existingUser.password)){
			//Creating jwt token
			token = jwt.sign(
				{ userId: existingUser.id, email: existingUser.email },
				jwtSecretKey,
				{ expiresIn: "1h" }
			);
		}else{
			console.log("Invalid password");
			const error = new Error("Invalid password");
			return next(error);
		}
		
	} catch (err) {
		console.log(err);
		const error = new Error("Error! Something went wrong.");
		return next(error);
	}

	res
		.status(200)
		.json({
			success: true,
			data: {
				userId: existingUser.id,
				email: existingUser.email,
				token: token,
			},
		});
});

// Handling post request
app.post("/signup", async (req, res, next) => {
	console.log("req.body::");
	console.log( req.body);
	const { name, email, password } = req.body;
	const existUser = await User.findOne({
		email:email
	});
	let newUser;
	console.log("existUser:: "+existUser)
	if(existUser == null){
		try {
			newUser = await new User({
				name,
				email,
				password
			});
			await newUser.save();
		} catch {
			const error = new Error("Error! Something went wrong.");
			return next(error);
		}
	}else{
		res.send({
			errorCode:"USER_EXISTS",
			message:"User already exists",
			status:false
		});
	}	

	let token;
	try {
		token = jwt.sign(
			{ userId: newUser.id, email: newUser.email },
			jwtSecretKey,
			{ expiresIn: "1h" }
		);
	} catch (err) {
		const error = new Error("Error! Something went wrong.");
		return next(error);
	}
	res
		.status(201)
		.json({
		success: true,
		data: { userId: newUser.id,
			email: newUser.email, token: token },
		});
});

app.post("/add/cart", verifyToken, async (req, res, next) => {
	console.log("req.body:: /add/cart");
	console.log( req.body);
	const { userId, productId } = req.body;
	let existingProduct;
	let newCart;
	try {
		existingProduct = await Cart.findOne({ productId: productId });
		console.log("existingProduct::")
		console.log(existingProduct)
	} catch {
		const error = "Error! Something went wrong.";
		res.send({
			status:false,
			message:error
		})	
	}
    console.log(existingProduct)
	if(existingProduct){
		const error = "Product already exists!";
		res.send({
			status:false,
			message:error,
			errorCode: "PRODUCT_EXISTS"
		})		
	}else{
		newCart = await Cart({		
			userId,
			productId
		});
	}	

	try {
		await newCart.save();
		res
		.status(201)
		.json({
		success: true,
		data: { userId: newCart.id },
		});
	} catch {		
		res.send({
			status:false,
			message:"Error! Something went wrong."
		})	
	}		
});

app.get("/get/cart",verifyToken, async (req, res, next) => {
	console.log("Inside get cart::");
	console.log( req.body);
	const { userId } = req.body;
	try{
		Cart.find({userId:userId},function(err,data){
			res
			.status(200)
			.json({
			success: true,
			data: { records: data },
			});	
		})	
	}catch(e){
		res.send({
			status:false,
			message:"Error! Something went wrong."
		})	
	}				
});
app.get("/get/products", async (req, res, next) => {
	console.log("Inside Get Products::");		
	ProductsRecord.find({},function(err,data){
		res
		.status(200)
		.json({
			success: true,
			data: data,
		});
	})			
});

app.get("/", async (req, res, next) => {	
	res.send("Welcome to S-MART");
});

//Connecting to the database
mongoose
.connect("mongodb+srv://devenv:devenv@cluster0.xj3j5.mongodb.net/smartdeliveryapp?retryWrites=true&w=majority")
.then(() => {
	app.listen(process.env.PORT, () => {
	console.log("Server is listening on port "+process.env.PORT);
	});
})
.catch((err) => {
	console.log("Error Occurred");
});
