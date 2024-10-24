const express = require("express");
const carsRouter = express.Router();
const db = require("../database");

// Test route
carsRouter.get("/test", (req, res) => {
	res.json({
		msg: "cars route test ok !!",
	});
});

// GET: Récupérer la liste de toutes les voitures
carsRouter.get("/", (req, res) => {
	db.all("SELECT * FROM cars", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

// POST: Ajouter une nouvelle voiture
carsRouter.post("/", (req, res) => {
	const { carName, carYear, carImage } = req.body;

	// Validation simple des données
	if (!carName || typeof carName !== "string" || /[^a-zA-Z0-9 ]/.test(carName)) {
		return res.status(400).json({ msg: "Invalid car name" });
	}

	if (!carYear || isNaN(carYear) || carYear.toString().length !== 4) {
		return res.status(400).json({ msg: "Invalid car year" });
	}

	if (!carImage || typeof carImage !== "string") {
		return res.status(400).json({ msg: "Invalid car image URL" });
	}

	// Insertion dans la base de données
	db.run(
		"INSERT INTO cars (carName, carYear, carImage) VALUES (?, ?, ?)",
		[carName, carYear, carImage],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID });
			}
		}
	);
});

// PUT: Mettre à jour une voiture par ID
carsRouter.put("/:id", (req, res) => {
	const { id } = req.params;
	const { carName, carYear, carImage } = req.body;

	// Validation des données
	if (!carName || typeof carName !== "string" || /[^a-zA-Z0-9 ]/.test(carName)) {
		return res.status(400).json({ msg: "Invalid car name" });
	}

	if (!carYear || isNaN(carYear) || carYear.toString().length !== 4) {
		return res.status(400).json({ msg: "Invalid car year" });
	}

	if (!carImage || typeof carImage !== "string") {
		return res.status(400).json({ msg: "Invalid car image URL" });
	}

	// Mise à jour dans la base de données
	db.run(
		"UPDATE cars SET carName = ?, carYear = ?, carImage = ? WHERE id = ?",
		[carName, carYear, carImage, id],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else if (this.changes === 0) {
				// Si aucune voiture n'a été mise à jour
				res.status(404).json({ msg: "Car not found" });
			} else {
				// Mise à jour réussie
				res.json({ changes: this.changes });
			}
		}
	);
});

// DELETE: Supprimer une voiture par ID
carsRouter.delete("/:id", (req, res) => {
	const { id } = req.params;

	// Vérifier si la voiture existe avant suppression
	db.get("SELECT * FROM cars WHERE id = ?", [id], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else if (!row) {
			// Voiture non trouvée
			res.status(404).json({ msg: "Car not found" });
		} else {
			// Suppression de la voiture
			db.run("DELETE FROM cars WHERE id = ?", [id], function (err) {
				if (err) {
					res.status(500).json({ error: err.message });
				} else {
					res.json({ changes: this.changes });
				}
			});
		}
	});
});

// GET: Récupérer une seule voiture par ID
carsRouter.get("/:id", (req, res) => {
	const { id } = req.params;

	// Requête pour obtenir une voiture par son ID
	db.get("SELECT * FROM cars WHERE id = ?", [id], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else if (!row) {
			// Voiture non trouvée
			res.status(404).json({ msg: "Car not found" });
		} else {
			// Voiture trouvée, renvoyer l'objet
			res.json(row);
		}
	});
});

module.exports = carsRouter;
