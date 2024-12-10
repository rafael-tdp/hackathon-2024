const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

mongoose
	.connect(process.env.MONGO_URI, {})
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch((err) => console.error("Erreur de connexion à MongoDB:", err));

app.get("/", (req, res) => {
	res.send("Bienvenue sur l'API !");
});

app.listen(PORT, () => {
	console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
