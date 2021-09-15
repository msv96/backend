import express from "express";
import cors from "cors";
import mongo from "mongodb";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
// import bcryptjs from "bcrypt";

const app = express();
dotenv.config();
const mongoClient = mongo.MongoClient;
const url = process.env.DB;
const port = process.env.PORT || 3001;

function authenticate(req, res, next) {
	try {
		if (req.headers.authorization) {
			jwt.verify(
				req.headers.authorization,
				process.env.JWT_SECRET,
				function (error, decoded) {
					if (error) {
						res.status(500).json({
							message: "Unauthorized",
						});
					} else {
						// req.userid = decoded.id;
						next();
					}
				}
			);
		} else {
			res.status(401).json({
				message: "No Token Present",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "Internal Server Error",
		});
	}
}

app.use(
	cors({
		origin: "*",
	})
);
app.use(express.json());

app.get("/", async (req, res) => {
	try {
		// let client = await mongoClient.connect(url);
		// let db = client.db("pizza");
		// let data = await db
		// 	.collection("products")
		// 	.find();
		// client.close();
		let tok = jwt.sign({msg:"jwt"}, process.env.JWT_SECRET);
		res.json({ msg: tok });
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong",
		});
	}
});

app.get("/token",[authenticate], async (req, res) => {
	try {
		res.json({ msg: "HI" });
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong",
		});
	}
});

app.listen(port, () => {
	console.log("The Server is Listening in ", port);
});
