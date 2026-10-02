const express = require("express");
const cors = require("cors");

const plants = require("./data/plants.json");
const problems = require("./data/problems.json");
const seasons = require("./data/seasons.json");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// =========================
// HOME
// =========================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🌱 NurseryIQ Backend is running!",
        version: "1.0.0"
    });
});

// =========================
// HEALTH CHECK
// =========================
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "OK",
        message: "Backend connected successfully",
        totalPlants: plants.length
    });
});

// =========================
// ALL PLANTS
// =========================
app.get("/api/plants", (req, res) => {
    let result = [...plants];

    const {
        search,
        category,
        sunlight,
        watering,
        difficulty,
        placement,
        season
    } = req.query;

    if (search) {
        const keyword = search.toLowerCase();

        result = result.filter((plant) =>
            JSON.stringify(plant)
                .toLowerCase()
                .includes(keyword)
        );
    }

    if (category) {
        result = result.filter(
            (plant) =>
                plant.category.toLowerCase() ===
                category.toLowerCase()
        );
    }

    if (sunlight) {
        result = result.filter(
            (plant) =>
                plant.sunlight.toLowerCase() ===
                sunlight.toLowerCase()
        );
    }

    if (watering) {
        result = result.filter(
            (plant) =>
                plant.watering.toLowerCase() ===
                watering.toLowerCase()
        );
    }

    if (difficulty) {
        result = result.filter(
            (plant) =>
                plant.difficulty.toLowerCase() ===
                difficulty.toLowerCase()
        );
    }

    if (placement) {
        result = result.filter(
            (plant) =>
                plant.placement.toLowerCase() ===
                placement.toLowerCase()
        );
    }

    if (season) {
        result = result.filter((plant) =>
            plant.bestSeason
                .toLowerCase()
                .includes(season.toLowerCase())
        );
    }

    res.json({
        success: true,
        count: result.length,
        plants: result
    });
});

// =========================
// SINGLE PLANT
// =========================
app.get("/api/plants/:id", (req, res) => {
    const id = req.params.id;

    const plant = plants.find(
        (item) =>
            String(item.id) === String(id) ||
            item.slug === id
    );

    if (!plant) {
        return res.status(404).json({
            success: false,
            message: "Plant not found"
        });
    }

    res.json({
        success: true,
        plant: plant
    });
});

// =========================
// CATEGORIES
// =========================
app.get("/api/categories", (req, res) => {
    const categories = [
        ...new Set(
            plants.map((plant) => plant.category)
        )
    ];

    res.json({
        success: true,
        categories: categories
    });
});

// =========================
// STATISTICS
// =========================
app.get("/api/stats", (req, res) => {
    const categories = [
        ...new Set(
            plants.map((plant) => plant.category)
        )
    ];

    res.json({
        success: true,
        totalPlants: plants.length,
        totalCategories: categories.length,
        categories: categories
    });
});

// =========================
// PROBLEMS
// =========================
app.get("/api/problems", (req, res) => {
    res.json({
        success: true,
        problems: problems
    });
});

// =========================
// SINGLE PROBLEM
// =========================
app.get("/api/problems/:id", (req, res) => {
    const problem = problems.find(
        (item) => item.id === req.params.id
    );

    if (!problem) {
        return res.status(404).json({
            success: false,
            message: "Plant problem not found"
        });
    }

    res.json({
        success: true,
        problem: problem
    });
});

// =========================
// SEASONS
// =========================
app.get("/api/seasons", (req, res) => {
    res.json({
        success: true,
        seasons: seasons
    });
});

// =========================
// PLANTS BY SEASON
// =========================
app.get("/api/seasons/:season", (req, res) => {
    const requestedSeason =
        req.params.season.toLowerCase();

    const result = plants.filter((plant) => {
        const plantSeason =
            plant.bestSeason.toLowerCase();

        return (
            plantSeason.includes(requestedSeason) ||
            plantSeason === "all"
        );
    });

    res.json({
        success: true,
        season: req.params.season,
        count: result.length,
        plants: result
    });
});

// =========================
// RECOMMEND PLANTS
// =========================
app.get("/api/recommend", (req, res) => {
    const {
        category,
        sunlight,
        watering,
        placement,
        difficulty
    } = req.query;

    let results = plants.map((plant) => {
        let score = 0;

        if (
            category &&
            plant.category.toLowerCase() ===
                category.toLowerCase()
        ) {
            score += 3;
        }

        if (
            sunlight &&
            plant.sunlight.toLowerCase() ===
                sunlight.toLowerCase()
        ) {
            score += 2;
        }

        if (
            watering &&
            plant.watering.toLowerCase() ===
                watering.toLowerCase()
        ) {
            score += 2;
        }

        if (
            placement &&
            plant.placement.toLowerCase() ===
                placement.toLowerCase()
        ) {
            score += 2;
        }

        if (
            difficulty &&
            plant.difficulty.toLowerCase() ===
                difficulty.toLowerCase()
        ) {
            score += 1;
        }

        return {
            ...plant,
            recommendationScore: score
        };
    });

    results.sort(
        (a, b) =>
            b.recommendationScore -
            a.recommendationScore
    );

    res.json({
        success: true,
        count: results.length,
        plants: results.slice(0, 20)
    });
});

// =========================
// FEEDBACK
// =========================
app.post("/api/feedback", (req, res) => {
    console.log("New feedback:");
    console.log(req.body);

    res.status(201).json({
        success: true,
        message: "Feedback received successfully"
    });
});

// =========================
// INVALID ROUTE
// =========================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("🌱 NurseryIQ Backend Started");
    console.log("=================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Plants: ${plants.length}`);
    console.log("=================================");
    console.log("");
});