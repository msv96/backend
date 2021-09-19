import express from "express";
import cors from "cors";
import mongo from "mongodb";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcryptjs from "bcrypt";

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
							code: false,
						});
					} else {
						req.userid = decoded.id;
						next();
					}
				}
			);
		} else {
			res.status(401).json({
				message: "No Token Present",
				code: false,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "Internal Server Error",
			code: false,
		});
	}
}

app.use(
	cors({
		origin: "*",
	})
);
app.use(express.json());

app.get("/data", [authenticate], async (req, res) => {
	try {
		let client = await mongoClient.connect(url);

		let db = client.db("pizza");

		let data = await db.collection("products").find().toArray();

		client.close();

		res.json(data);
	} catch (error) {
		res.status(404).json({
			message: "Something went wrong",
			code: false,
		});
	}
});

app.post("/register", async function (req, res) {
	try {
		let client = await mongoClient.connect(url);

		let db = client.db("pizza");

		let salt = bcryptjs.genSaltSync(10);

		let hash = bcryptjs.hashSync(req.body.pwd, salt);

		req.body.pwd = hash;

		let data = await db.collection("users").insertOne(req.body);

		await client.close();

		res.json({
			message: "User Registered",
			id: data._id,
			code: true,
		});
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong",
			code: false,
		});
	}
});

app.post("/signin", async function (req, res) {
	try {
		let client = await mongoClient.connect(url);

		let db = client.db("pizza");

		let user = await db
			.collection("users")
			.findOne({ mail: req.body.mail });

		if (user) {
			let matchPassword = bcryptjs.compareSync(req.body.pwd, user.pwd);
			if (matchPassword) {
				let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
				res.json({
					message: true,
					code: true,
					token,
				});
			} else {
				res.status(404).json({
					message: "Username/Password is incorrect",
					code: false,
				});
			}
		} else {
			res.status(404).json({
				message: "Username/Password is incorrect",
				code: false,
			});
		}
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong",
			code: false,
		});
	}
});

app.listen(port, () => {
	console.log("The Server is Listening in", port);
});
