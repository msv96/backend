import express from "express";
import cors from "cors";

const app = express();
const port = process.env.port || 3001;

app.use(express.json());
app.use(
	cors({
		origin: "*",
	})
);

app.listen(port, () => {
	console.log("The Server is Listening in ", port);
});
